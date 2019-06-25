"use strict";

const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const client = redis.createClient();

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

const setFieldToHash = async function(hash, field_name, field_val) {
  return await client.hsetAsync(hash, field_name, field_val);
};

const getFieldFromHash = async function(hash, field_name) {
  if (await client.hexists(hash, field_name)) {
    return await client.hgetAsync(hash, field_name);
  }
  return 0;
};

const getAllFieldsNameFromHash = async function(hash) {
  return await client.hkeysAsync(hash);
};

const getAllFieldsValFromHash = async function(hash) {
  return await client.hvalsAsync(hash);
};

const getFieldLengthFromHash = async function(hash) {
  return await client.hlenAsync(hash);
};

const delFieldFromHash = async function(hash, field_name) {
  if (await client.hexists(hash, field_name)) {
    return await client.hdelAsync(hash, field_name);
  }
  return 0;
};

const getAllFieldsFromHash = async function(hash) {
    return await client.hgetallAsync(hash);
}

module.exports = {
    quit: quit,
    getBasicValue: getBasicValue,
    setBasicValue: setBasicValue,
    lpushToLinkedList: lpushToLinkedList,
    rpopFromLinkedList: rpopFromLinkedList,
    getCurrentTaskFromLinkedList: getCurrentTaskFromLinkedList,
    getTaskLength: getTaskLength,
    isKeyExist: isKeyExist,
    delLinkedList: delLinkedList,
    setFieldToHash: setFieldToHash,
    getFieldFromHash: getFieldFromHash,
    getAllFieldsNameFromHash: getAllFieldsNameFromHash,
    getAllFieldsValFromHash: getAllFieldsValFromHash,
    getFieldLengthFromHash: getFieldLengthFromHash,
    delFieldFromHash: delFieldFromHash,
    getAllFieldsFromHash: getAllFieldsFromHash
}
