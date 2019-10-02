"use strict";

const redis = require('redis');
const config = require('config');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {
  getFieldFromHash,
  setFieldToHash
} = require('./redis_helper');


const check_interval_ms = config.get('Agent_Check_Interval_ms');
const Redis_url = config.get('Redis.URL');
const Conn_timeout_ms = config.get('Redis.Conn_timeout_ms');
const Conn_retry_interval_ms = config.get('Redis.Conn_retry_interval_ms');
const Agent_Hash_name = config.get('Redis.Agent_Hash_name');
const Worker = config.get('Redis.Worker');

//avoid to ps the ps process itself, using []
const check_local_redis_pid = `ps -ef | grep redis | grep -i [s]erver | awk '{print $2}'`;
const check_local_bzt_pid = `ps -ef | grep bzt | grep -i [p]ython | awk '{print $2}'`;

let agent_status, count = 0;

function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}

(async() => {

  // Setup Connection to Redis Server
  console.log(`Trying to Connect to Redis server ${Redis_url}...`);
  const client = redis.createClient({url: Redis_url, connect_timeout: Conn_timeout_ms});
  console.log("Connected to target Redis server? " + client.connected);
  
  while (!client.connected) {
    console.log(`Retrying to Connect to Redis server ${Redis_url} after ${Conn_retry_interval_ms}ms...`);
    await sleep(Conn_retry_interval_ms);
  }

  // Check Agent status every 5 seconds
  await setInterval(
    async() => {
      try {
        // get init agent status from redis server, sync-up every 5 seconds
        let prev_agent_status = await getFieldFromHash(client, Agent_Hash_name, Worker);
        console.log(`previous agent status: ${prev_agent_status}`); // PS. it is a string: "0"

        // check if there is RQ worker running on load agent
        console.log(`Checking Agent RQ worker status every ${check_interval_ms} ms...`);
        
        const { stdout } = await exec(check_local_redis_pid); // stdout: '43026\n'
        let rq_pids = stdout.split("\n"); // [ '43026', '' ]
        rq_pids.pop();
    
        if (rq_pids.length === 1) {
          console.log('RQ PID:', rq_pids);
          
          const { stdout } = await exec(check_local_bzt_pid);
          const bzt_pid = stdout.split("\n");
          bzt_pid.pop();
          console.log('BZT PID:', bzt_pid);
    
          if(bzt_pid.length === 1) {
            console.log('bzt process found,  test agent is busy...');
            agent_status = "1";
            if (prev_agent_status !== agent_status) {
              // update the agent status to redis server
              await setFieldToHash(client, Agent_Hash_name, Worker, agent_status);
            }
          } else {
            console.log('bzt process not found, test agent is idle...');
            agent_status = 0;
            if (prev_agent_status !== agent_status) {
              // update the agent status to redis server
              await setFieldToHash(client, Agent_Hash_name, Worker, agent_status);
            }
          }
        } else {
          console.error('[CRITICAL]: RQ process not found, need to start it now...');
          agent_status = -1;
          if (prev_agent_status !== agent_status) {
            // update the agent status to redis server
            await setFieldToHash(client, Agent_Hash_name, Worker, agent_status);
          }
        }
      }
      finally {
          count++;
          console.log(`current loop: ${count}`);
          console.log(`agent status: ${agent_status}`);
      }
    }, check_interval_ms);
})();
