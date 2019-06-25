"use strict";

const {
  quit,
  setFieldToHash,
  getAllFieldsValFromHash,
  getAllFieldsNameFromHash,
  getAllFieldsFromHash
  
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
    console.log(`Server Status in Redis : ${JSON.stringify(await getAllFieldsFromHash(server_status))}`);

    let server_names = await getAllFieldsNameFromHash(server_status);
    console.log(`All workers detail info: ${server_names}`);
    let field_vals = await getAllFieldsValFromHash(server_status);
    console.log(`All workers current status: ${field_vals}`);

    // Mock worker status
    console.log("Changing workers status...");
    await setFieldToHash(server_status, workers[0], Math.round(Math.random()));
    await setFieldToHash(server_status, workers[1], Math.round(Math.random()));
    await setFieldToHash(server_status, workers[2], Math.round(Math.random()));

    // Check if there is any worker idle, ['1', '0', '0']
    field_vals = await getAllFieldsValFromHash(server_status);
    console.log(`All workers current status: ${field_vals}`);
    

    let idle_worker_indx = field_vals.findIndex( val => {
      return val === '0';
    });
    console.log(`Avaible worker index : ${idle_worker_indx}`);

    let worker_selected = (idle_worker_indx > -1) ? server_names[idle_worker_indx] : 'nil' ;
    console.log(`Avaible worker info : ${worker_selected}`);
  }
  finally {
    quit();
  }
})();
