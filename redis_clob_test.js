"use strict"

const fs = require('fs');
const {
  setMuFieldsToHash,
  getFieldFromHash,
  quit
} = require('./redis_helper');
const cp = require('child_process');

const sample_test_id = "clob_10001";
const ts = Date.now();

// read csv file 
const csv_file = fs.readFileSync("./upload/paths.csv", "utf8");
console.log(csv_file);

// read xml file
const xml_file = fs.readFileSync("./upload/sample.jmx", "utf8");
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
                fs.mkdirSync(`./tmp/${test_name}`, { recursive: true });
            }
            // write the files into test folder
            fs.writeFileSync(`./tmp/${test_name}/test.jmx`, file_to_dump);
            fs.writeFileSync(`./tmp/${test_name}/data.csv`, data_to_dump);
        } catch (err) {
            console.error(err);
        }
    }
    await quit();

    // execute the dummy jmeter tests
    let result = cp.execSync('~/Tools/apache-jmeter-5.1.1/bin/jmeter -n -t ./tmp/demo/test.jmx -l ./tmp/demo/result.jtl').toString();
    console.log(result);
})();
