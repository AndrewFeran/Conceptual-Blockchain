const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');

// get input func
function getInput(prompt) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(prompt, (input) => {
            resolve(input);
            rl.close();
        });
    });
}

// create a new block
async function createBlock(name) {
    const data = await getInput("Please provide data for the block: ").then(ans => { return ans; });
    
    // Read the files in the confirmed_blocks directory
    const files = await fs.promises.readdir('./confirmed_blocks');
        
    // Get the last file name and convert it to an integer
    const prevId = parseInt(files[files.length - 1]);

    // Read the content of the last block's JSON file
    const obj = await fs.promises.readFile(`./confirmed_blocks/${prevId}.json`, 'utf8');
    
    // Parse the JSON data and extract the hash
    const prevHash = JSON.parse(obj).hash;

    let newBlock = {
        id: prevId+1,
        prevHash: prevHash,
        nonce: 0,
        sender: name,
        data: data,
        hash: 0,
        confirmed_by: ""
    }

    fs.writeFileSync(`./pending_blocks/${newBlock.id}.json`, JSON.stringify(newBlock, null, 4), 'utf-8', (err) => {
        if (err) throw err;
    });
}

// mine a block
async function mine(name) {
    // Read the files in the pending_blocks directory
    const files = await fs.promises.readdir('./pending_blocks');
    if (files.length == 0) {
        console.log("There are no pending blocks!");
        return;
    }

    // Read the content of the first block's JSON file
    const obj = await fs.promises.readFile(`./pending_blocks/${files[0]}`, 'utf8');
    let input = JSON.parse(obj);

    // loop thru trying to find a nonce that creates a valid POW
    while (true) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(input));
        const digest = hash.digest('hex');
        let zeros = 0;
        for(i = 0; i < 4; i++) {
            if (digest[i] != 0) break;
            else zeros++;
        }
        if (zeros == 4) {
            input.hash = digest;
            input.confirmed_by = name;
            break;
        }
        input.nonce++;
    }

    // 'move' the block to the confirmed blocks
    fs.writeFileSync(`./confirmed_blocks/${input.id}.json`, JSON.stringify(input, null, 4), 'utf-8', (err) => {
        if (err) throw err;
    });

    fs.unlink(`./pending_blocks/${input.id}.json`, (err) => {
        if (err) throw err;
    });

}

// main program
( async () => {
    // get name
    const name = await getInput("What is your name? ").then(ans => { return ans; });
    console.log(`Hello ${name}`);

    // run the program
    while (true) {
        let action = await getInput("What would you like to do? (1) New block (2) Mine: ").then(ans => { return ans; });
        switch(action) {
            case '1':
                await createBlock(name);
                break;
            case '2':
                await mine(name);
                break;
        }
    }
    
})();