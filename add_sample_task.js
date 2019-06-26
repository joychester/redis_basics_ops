"use strict";

const {
    lpushToLinkedList,
    getTaskLength
} = require("./redis_helper");

const task_list = "mylist";

setInterval( async() => {
    let task_obj = {"mytask": Math.floor(Math.random()*10000)};
    let task_added = await lpushToLinkedList(task_list, task_obj);
    console.log('task_added_index: ' + task_added);
    console.log(`current total tasks : ${await getTaskLength(task_list)}`);
}, (Math.round(Math.random()*5000) + 10000));
