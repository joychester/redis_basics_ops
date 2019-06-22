"use strict";

const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const client = redis.createClient();
const mykey = "foo";
const mylist = "mylist";
const task = "petest" + Math.floor(Math.random()*10000);
const task_obj = {"mytask": Math.floor(Math.random()*10000)};

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
  if (typeof task === "object") {
    task = JSON.stringify(task);
  }
  return await client.lpushAsync(list, task);
};

const rpopFromLinkedList = async function(list) {
  return await client.rpopAsync(list);
};

const getCurrentTaskFromLinkedList = async function(list) {
  return await client.lindexAsync(list,-1);
};

const getTaskLength = async function(list) {
  return await client.llenAsync(list);
};

const isKeyExist = async function(key) {
  return (await client.existsAsync(key) > 0);
};

const delLinkedList = async function(list) {
  return await client.delAsync(list);
};

const setTaskToHash = async function(hash, field_name, field_val) {
  return await client.hsetAsync(hash, field_name, field_val);
};

const getTaskFromHash = async function(hash, field_name) {
  return await client.hgetAsync(hash, field_name);
};

const getAllFieldNameFromHash = async function(hash) {
  return await client.hkeysAsync(hash);
};

const getAllFieldValFromHash = async function(hash) {
  return await client.hvalsAsync(hash);
};

const getTaskLengthFromHash = async function(hash) {
  return await client.hlenAsync(hash);
};

const delTaskFromHash = async function(hash, field_name) {
  if (await client.hexists(hash, field_name)) {
    return await client.hdel(hash, field_name);
  }
  return 0;
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
    let task_size = await getTaskLength(mylist);
    console.log('task_size: ' + task_size);
    let task_added = await lpushToLinkedList(mylist, task);
    console.log('task_added_index: ' + task_added);
    let current_task = await getCurrentTaskFromLinkedList(mylist);
    console.log('current_task: ' + current_task);
    let task_popped = await rpopFromLinkedList(mylist);
    console.log('task_popped: ' + task_popped);
    
    task_added = await lpushToLinkedList(mylist, task_obj);
    console.log('task_added_index: ' + task_added);
    current_task = await getCurrentTaskFromLinkedList(mylist);
    console.log('current_task: ' + current_task);
    task_popped = await rpopFromLinkedList(mylist);
    console.log('task_popped: ' + task_popped);
  }
  finally {
    quit();
  }
})();
