'use strict';

/*
 * Created with @iobroker/create-adapter v1.31.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const Hyperion_API = require('./hyperion_API');

var hyperion_API;
var adapter = null;

// Load your modules here, e.g.:
// const fs = require("fs");

class HyperionNg extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'hyperion_ng',
        });

        adapter = this; // set this Class as this adapter for using logging global;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async readOutInstances() {

        hyperion_API.getServerInfo(function(err, result){
            adapter.log.debug(JSON.stringify(result));
            if( err == null && result.command == 'serverinfo') {

                var my_instances = result.info.instance;
                for (var instance in my_instances){
                
                    var my_instance_ID = instance;
                    var my_instance_Name = my_instances[instance].friendly_name;
                    var my_instance_running = my_instances[instance].running;

                    var myobj = {type: 'Instance_ID',common: {name: my_instance_Name}, native:{id: my_instance_Name}};
                    adapter.setObject(my_instance_ID.toString(), myobj);

                    myobj = {type: 'state', common: {role: 'running status', type: 'boolean', name: my_instance_Name}, native:{id: my_instance_ID + my_instance_Name}};
                    adapter.setObject(my_instance_ID + '.' + 'running', myobj);
                    adapter.setState(my_instance_ID + '.' + 'running', my_instance_running);

                }
            }
            else {
                adapter.log.error('Error at read out instances');
            }

            adapter.log.debug(JSON.stringify(result));
        }, 0);
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        hyperion_API = new Hyperion_API.Hyperion_API(this.config['address'], this.config['json_port'],this);

        await this.readOutInstances();
        // hyperion_API.getServerInfo(function(err, result){
        //     adapter.log.info('socket Connection: ' + hyperion_API.connected);
        //     adapter.log.info('communication successfull');
        //     adapter.log.info(JSON.stringify(result));
        // }, 0);

        this.subscribeStates('testVariable');
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    // onObjectChange(id, obj) {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    //     if (typeof obj === 'object' && obj.message) {
    //         if (obj.command === 'send') {
    //             // e.g. send email or pushover or whatever
    //             this.log.info('send command');

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    //         }
    //     }
    // }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new HyperionNg(options);
} else {
    // otherwise start the instance directly
    new HyperionNg();
}