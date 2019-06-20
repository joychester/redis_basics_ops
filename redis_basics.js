
"use strict";

const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const client = redis.createClient();
const mykey = "foo";
const mylist = "mylist";
const task = "petest" + Math.floor(Math.random()*10000);

const quit = async function() {
  await client.quitAsync();
};

const getBasicValue = async function(key) {
  return await client.getAsync(key); // ==> 'myValue'
};

const setBasicValue = async function(key, value) {
  return await client.setAsync(key, value); // ==> 'OK'
};

const lpushToLinkedList = async function(list, task) {
  return await client.lpushAsync(list, task);
};

const rpopFromLinkedList = async function(list) {
  return await client.rpopAsync(list);
};

const getCurrentTaskFromLinedList = async function(list) {
  return await client.lindexAsync(list,-1);
};

const getTaskLength = async function(list) {
  return await client.llenAsync(list);
};

/*
// basic key-value pair operations
(async() => {
  try {
    const status = await setBasicValue(mykey, "bar1234");
    console.log(status);
    if(status === 'OK') {
      let val = await getBasicValue(mykey);
      console.log(val);
    } else {
      console.log(status);
    }
  }
  finally {
    quit();
  }
})();
*/

// basic linked list operations
(async() => {
  try {
    const task_size = await getTaskLength(mylist);
    console.log('task_size: ' + task_size);
    const task_added = await lpushToLinkedList(mylist, task);
    console.log('task_added_index: ' + task_added);
    const current_task = await getCurrentTaskFromLinedList(mylist);
    console.log('current_task: ' + current_task);
    const task_popped = await rpopFromLinkedList(mylist);
    console.log('task_popped: ' + task_popped);
  }
  finally {
    quit();
  }
})();
