import crypto from 'crypto';
import { Buffer } from 'buffer';

async function main() {
    // Create a Diffie Helman value and generate our Diffie Helman Modulo result.
    let DH = crypto.createDiffieHellman(1000,2);
    let ourKey = DH.generateKeys();

    // Generate a random ID for the server to track us.
    let syncId = Math.ceil(Math.random() * 10000);
    
    // First sync request. Contains no relevant personal information. This message is unsafe to snooping the wire. 
    // Consists of our remainder and our generated key.
    let firstResponse = await fetch ("http://localhost:5173/secure/add/1",{
        method:"POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            syncId: syncId,
            Diffie:ourKey,
            Prime: DH.getPrime()
        })
    });
    // read that first result. 
    // let initialResponse = await firstResponse;
    // console.log(initialResponse);
    // let digestedDHKey = await initialResponse.json();

    let initialResponseText = await firstResponse.text();
    console.log("Initial response text:", initialResponseText);

    let digestedDHKey = JSON.parse(initialResponseText);

    

    // Read the Diffie Helman Modulo from the server and put it back into a buffer format as per https://nodejs.org/api/crypto.html
    const copy = JSON.parse(JSON.stringify(digestedDHKey.Helman), (key, value) => {
        return value && value.type === 'Buffer' ?
          Buffer.from(value) :
        value;
    });
    // Using that Diffie Helman Modulo, compute the symetric key value which we'll use for further communication.
    let secret = DH.computeSecret(copy);

    // Mostly overhead stuff so we can use cipher ia https://nodejs.org/api/crypto.html
    const algorithm = 'aes-192-cbc';
    const password = secret.toString("hex");
    const key = crypto.scryptSync(password, 'salt', 24,);
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    // take our intended JSON and encrypt it using our shared symmetric key via AES https://nodejs.org/api/crypto.html
    let encrypted = cipher.update(JSON.stringify({
                username: "Aubry",
                chatId:1,
                contents: "New Test"
            }), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Our next request sends only the encrypted JSON, along with our sync ID.
    // In theory we could send any number of these requests, so long as our key is still live. 
    // Keys as of now don't expire, so unless the server resets, clears garbage, or overrides with a new ID, these values persist. 
    let actualFetch = await fetch ("http://localhost:5173/secure/add/1",{
        method:"POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            syncId: syncId,
            params: encrypted
        })
    });
    let fetchResponse = await actualFetch.text();
    let fetchedResponse = JSON.parse(fetchResponse);
    console.log("Server response:", fetchedResponse);

    // Logging of relevant details to prove symetrical operation on both ends.
    console.log("Our key is:");
    console.log(ourKey);
    console.log("The server Key is:");
    console.log(copy);
    console.log("Combined they are");
    console.log(secret);
    console.log("Today I'm sending the server some encrypted JSON");
    console.log(JSON.stringify({
        username: "Aubry",
        chatId:1,
        contents: "New Test",
        syncId: syncId,
    }));
    console.log("It appears as follows on the wire");
    console.log(encrypted);
}
main();