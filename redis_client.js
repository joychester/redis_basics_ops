"use strict";

const {
  getTaskLength,
  setFieldToHash,
  getAllFieldsValFromHash,
  getAllFieldsNameFromHash,
  getAllFieldsFromHash,
  rpopFromLinkedList
  
} = require('./redis_helper');

const server_status = 'server_status';
const check_interval_ms = 5000;
const worker_busy_threshold = 10;
const task_list = "mylist";
let workers = ['1.1.1.1', '2.2.2.2', '3.3.3.3'];
let count = 0, busy = 0;

setInterval(async() => {
  try {
    // check if there is any task remain in Redis List
    console.log(`Checking Redis Task List every ${check_interval_ms} ms...`);
    
    if (await getTaskLength(task_list)) {

      console.log(`Checking Server status...`);

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

      // Pop the task from Redis List if there is avaible worker
      if(worker_selected !== 'nil') {
        let next_task = await rpopFromLinkedList(task_list);
        console.log(`going to process next task: ${next_task}`);
        busy = 0;

      // TO-DO: Send task to worker and get excuted
      } else {
        console.log(`all workers are busy currently, will check in next ${check_interval_ms}ms...`);
        busy++;
        if (busy > worker_busy_threshold) {
          console.log("[WARN]: ALL WORKER ARE BUSY FOR QUITE A WHILE, SOMETHING WRONG??");
        }
      }

    } else {
      console.log(`no task remaining currently, will check in next ${check_interval_ms}ms...`);
    }
  }
  finally {
      count++;
      console.log(`current loop: ${count}`);
  }
}, check_interval_ms);
