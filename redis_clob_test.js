"use strict"

const fs = require('fs');
const {
  setMuFieldsToHash,
  getFieldFromHash,
  quit
} = require('./redis_helper');

const sample_test_id = "clob_10001";
const ts = Date.now();

// read csv file 
const csv_file = fs.readFileSync("./upload/data.csv", "utf8");
console.log(csv_file);

// read xml file
const xml_file = fs.readFileSync("./upload/test.jmx", "utf8");
console.log(xml_file);

/* save object to redis:
{id:
    {
        testname: string
        testfile: string
        datafile: string
        timestamp: string
    }
}
*/

(async() => {
    let status = await setMuFieldsToHash(sample_test_id, 'testname', 'demo', 'testfile', xml_file, 'datafile', csv_file, 'timestamp', ts);
    console.log(status);
    if ('OK' === status) {
        // dump the testfile to local
        let test_name = await getFieldFromHash(sample_test_id, 'testname');
        let file_to_dump = await getFieldFromHash(sample_test_id, 'testfile');
        let data_to_dump = await getFieldFromHash(sample_test_id, 'datafile');
        try {
            // create a test folder if not exist
            if (test_name && !fs.existsSync(`./tmp/${test_name}`)) {
                // after node 10.12.0 support create a directory recursively
                fs.mkdirSync(`./tmp/${test_name}`, { recursive: true }); 
            }
            // write the files into test folder
            fs.writeFileSync(`./tmp/${test_name}/test.jmx`, file_to_dump);
            fs.writeFileSync(`./tmp/${test_name}/data.csv`, data_to_dump);
        } catch (err) {
            console.error(err)
        }
    }
    await quit();
})();
