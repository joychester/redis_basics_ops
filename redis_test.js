"use strict";

const {
  quit,
  setBasicValue,
  getBasicValue,
  lpushToLinkedList,
  rpopFromLinkedList,
  getCurrentTaskFromLinkedList,
  getTaskLength
} = require('./redis_helper');

const mykey = "foo";
const mylist = "mylist";
const task = "petest" + Math.floor(Math.random()*10000);
const task_obj = {"mytask": Math.floor(Math.random()*10000)};

(async() => {
  try {
    //Test_1: basic key-value pair operations
    const status = await setBasicValue(mykey, "bar1234");
    console.log(status);
    if(status === 'OK') {
      let val = await getBasicValue(mykey);
      console.log(val);
    } else {
      console.log(status);
    }

    //Test_2: basic linked list operations
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
