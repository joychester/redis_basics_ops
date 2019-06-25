"use strict";

const {
  quit,
  setFieldToHash,
  getAllFieldsValFromHash
  
} = require('./redis_helper');

let workers = ['1.1.1.1', '2.2.2.2', '3.3.3.3'];
const server_status = 'server_status';

(async() => {
  try {
    // Init task: set worker status to idle
    // 0: idle ; 1: busy ; 2: error
    workers.forEach( async(server_info) => {
      await setFieldToHash(server_status, server_info, 0);
    });
    let field_vals = await getAllFieldsValFromHash(server_status);
    console.log(field_vals);

    // Mock worker status
    await setFieldToHash(server_status, workers[0], 1);

    // Check if there is any worker idle, ['1', '0', '0']
    field_vals = await getAllFieldsValFromHash(server_status);
    console.log(field_vals);

  }
  finally {
    quit();
  }
})();
