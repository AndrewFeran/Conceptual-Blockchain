// accepts details of a new block and returns the pending block
const create_block = (id, previous_hash, name, data) => {
    return  {
        header: {
            id: id,
            previous_hash: previous_hash,
            time_created: new Date(),
            created_by: name,
        },
        body:  {
            data: data
        }
    };
};

// accepts a pending bock and returns the confirmed block
const confirm_block = (block, name) => {
    const crypto = require('crypto');

    let nonce = 0;
    let hash;

    while (true) { // loop thru to find hash that is satisfactory proof of work
        const newHash = crypto.createHash('sha256');
        newHash.update(JSON.stringify(block)+nonce);
        const digest = newHash.digest('hex');
        let zeros = 0;

        for(i = 0; i < 6; i++) { // check number of zeros
            if (digest[i] != 0) break;
            else zeros++;
        }

        if (zeros == 4) {
            hash = digest;
            break;
        }
        
        nonce++;
    }
    
    return {
        header: {
            id: block.header.id,
            previous_hash: block.header.previous_hash,
            time_created: block.header.time_created,
            created_by: block.header.created_by,
            time_confirmed: new Date(),
            confirmed_by: name,
            nonce: nonce,
            hash: hash
        },
        body: {
            data: block.body.data
        }
    };
};

exports.create_block = create_block;
exports.confirm_block = confirm_block;