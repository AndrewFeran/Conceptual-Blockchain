const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');
const { create_block, confirm_block } = require('./block.js');

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
async function newBlock(name) {
    // get the data for the block's body
    const data = await getInput("Please provide data for the block: ").then(ans => { return ans; });
    var id;
    var prevHash = 0; // initialize prevHash to 0 in the case the previous block doesnt have a hash (is unconfirmed)

    // check if there are any pending blocks (if so then add this new block to the queue)
    var files = await fs.promises.readdir('./unconfirmed_blocks');
    if (files.length > 0) { // add new block to the queue (we will worry about previous hash later when mining)            
        // Get the last file name and convert it to an integer and add one to get new id
        id = parseInt(files[files.length - 1])+1;
    }
    else {
        // Read the files in the confirmed_blocks directory
        files = await fs.promises.readdir('./confirmed_blocks');
            
        // Get the last file name and convert it to an integer and add one to get new id
        id = parseInt(files[files.length - 1])+1;
    
        // Read the content of the last block's JSON file
        obj = await fs.promises.readFile(`./confirmed_blocks/${id-1}.json`, 'utf8');
        
        // Parse the JSON data and extract the hash
        prevHash = JSON.parse(obj).header.hash;
    }
    
    // call create block function to return a new unconfirmed block object
    let block = create_block(id, prevHash, name, data);

    // write this object to the centralized file system
    fs.writeFileSync(`./unconfirmed_blocks/${id}.json`, JSON.stringify(block, null, 4), 'utf-8', (err) => {
        if (err) throw err;
    });
}

// mine a block
async function mine(name) {
    // Read the files in the unconfirmed_blocks directory
    const files = await fs.promises.readdir('./unconfirmed_blocks');
    if (files.length == 0) {
        console.log("There are no pending blocks!");
        return;
    }

    // Read the content of the first block's JSON file
    const obj = await fs.promises.readFile(`./unconfirmed_blocks/${files[0]}`, 'utf8');
    let input = JSON.parse(obj);

    // check to see if previous_hash is zero (i.e. this block came after a previously unconfirmed block)
    if (input.header.previous_hash == "0") {
        input.header.previous_hash = JSON.parse(await fs.promises.readFile(`./confirmed_blocks/${input.header.id-1}.json`, 'utf8')).header.hash;
    }

    let output = confirm_block(input, name);

    // 'move' the block to the confirmed blocks
    fs.writeFileSync(`./confirmed_blocks/${output.header.id}.json`, JSON.stringify(output, null, 4), 'utf-8', (err) => {
        if (err) throw err;
    });

    fs.unlink(`./unconfirmed_blocks/${output.header.id}.json`, (err) => {
        if (err) throw err;
    });

}

// main program
(async () => {
    // get name
    const name = await getInput("What is your name? ").then(ans => { return ans; });
    console.log(`Hello ${name}`);

    // run the program
    while (true) {
        let action = await getInput("What would you like to do? (1) New block (2) Mine: ").then(ans => { return ans; });
        switch(action) {
            case '1':
                await newBlock(name);
                break;
            case '2':
                await mine(name);
                break;
        }
    }
    
})();