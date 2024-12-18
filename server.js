import bodyparser from "body-parser";
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from "crypto";
import { Buffer } from 'buffer';
const app = express();
const supaUrl = 'https://vzbhfkyolnultxzzdtzd.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Ymhma3lvbG51bHR4enpkdHpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQ4ODk5OCwiZXhwIjoyMDQ4MDY0OTk4fQ.IV-FzWvvPGWLfpIVTgloOaFYPqK9arXztX9GcE3c6bQ';
const supabase = createClient(supaUrl, supaAnonKey);
app.use(bodyparser.json());
// Use to hold secrets in practice. In reality this would periodically clear to prevent a memory leak. 
let storedSecrets = [];

app.get('/', (req, res) => {
    res.send('Welcome to the Duckie Buddy API. Use specific endpoints for functionality.');
});

// app.get('/recent', async (req, res) => {
//     // Mostly irrelevant to the encryption concepts, for use in supplying JSON to a webapp.
//     const {data, error} = await supabase
//     .from("message")
//     .select('author, contents')
//     .eq("chatid", 1);
//     console.log("hi");
//     if (!data || data.length == 0){res.send({error: "Nothing found :/"})}
//     if (error) {
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
//     else {res.send(data);
//         console.log(data);
//     }
// });

app.get('/recent', async (req, res) => {
    const { data, error } = await supabase
        .from("message")
        .select('author, contents');

    if (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json(data || []);
});

app.post('/secure/add/:chat', async (req, res) => {
    // Responsible for the first message key share. Expects to recieve a Diffie Helman Modulo key from the requesting client as the Diffie Field.
    if(req.body.Diffie){
        // Reading the respective prime and key and putting them into a buffer as per https://nodejs.org/api/crypto.html
        const copyDiffie = JSON.parse(JSON.stringify(req.body.Diffie), (key, value) => {
            return value && value.type === 'Buffer' ? Buffer.from(value) : value;
        });
        const copyPrime = JSON.parse(JSON.stringify(req.body.Prime), (key, value) => {
            return value && value.type === 'Buffer' ? Buffer.from(value) : value;
        });

        console.log("here");

        // Take the prime and generate a similar Diffie Helman Modulo key, then apply our number to the client's key to generate our symetric key.
        let DH = crypto.createDiffieHellman(copyPrime);
        let ourKey = DH.generateKeys();
        let tempSecret = DH.computeSecret(copyDiffie);

        // Store these generated symetric keys based on the recieved SyncID. In an actual impliementation this would time out after
        // a certain period, however I didn't wish to deal with that, so this persists forever and would cause a memory leak. 
        let tempStorage = {
            syncId:req.body.syncId,
            secret:tempSecret
        };
        storedSecrets.push(tempStorage);

        //Logging details about this process to prove symetrical operation
        console.log("Client's Key");
        console.log(copyDiffie);
        console.log("Our key");
        console.log(ourKey);
        console.log("Combined Secret");
        console.log(tempSecret);
        res.send({
            Helman:ourKey
        });

    }
    else if(!isNaN(Number(req.params.chat)) && req.body.params){
        // Handles the request if we recieve a request with the params field. 
        // First try to find the symetric key with the given SyncID
        let matchedSecret;
        storedSecrets.forEach(element => {
            if (element.syncId == req.body.syncId){
                matchedSecret = element.secret.toString("hex");
            }
        });
        if (!matchedSecret){
            res.send({error:"No Matching Secret found..."});
        }
        else{
            // Mostly overhead to utilize scryptSync amd createDevipheriv via https://nodejs.org/api/crypto.html
            const algorithm = 'aes-192-cbc';
            const iv = Buffer.alloc(16, 0);
            const key = crypto.scryptSync(matchedSecret, 'salt', 24,);
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            // Read and parse the encrypted body from our request
            let encrypted = req.body.params;
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            let params = JSON.parse(decrypted);

            // Supabase request, just to persist changes on the net.
            const {error} = await supabase
            .from("message")
            .insert({author: params.username, chatid: params.chatId, contents: params.contents});
            // Logging details about the decryption to prove symetric operation 
            console.log("Heres the request from the client");
            console.log(req.body);
            console.log("Decrypting the params field gets us some JSON");
            console.log(params);
            if (error) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.send({message: "Received"});
        }
    }
    else {res.send({error: "Request not as expected. Check that you are requesting add/[NUMBER] or that your body is correctly setup"})}
})

app.post('/add/:chat', async (req, res) => {
    // Mostly irrelevant to the encryption concepts, the simplified version of the above implementaiton, with no security. 
    console.log(req.body);
    if(!isNaN(Number(req.params.chat))){
        const {error} = await supabase
        .from("message")
        .insert({author: req.body.username, chatid: req.body.chatId, contents: req.body.contents});
        //Dummy data rn, need to figure out how to read HTTP bodies.
        console.log(error);
        console.log(req.body.username);
        res.send({message: "Received"});
    }
    else {res.send({error: "Put in a year silly :p"})}
})
app.listen(5173, () => {
    console.log('listening on port 5173');
});