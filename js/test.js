#!/usr/bin/env node 
  
 require('localenv'); 
 require('babel-register'); 
  
 const log = require('bookrc'); 
 const debug = require('debug')('localtunnel'); 
 const optimist = require('optimist'); 
  
 const argv = optimist 
 .usage('Usage: $0 --port [num]') 
 .options('secure', { 
 default: false, 
 describe: 'use this flag to indicate proxy over https' 
 }) 
 .options('port', { 
 default: '80', 
 describe: 'listen on this port for outside requests' 
 }) 
 .options('max-sockets', { 
 default: 10, 
 describe: 'maximum number of tcp sockets each client is allowed to establish at one time (the tunnels)' 
 }) 
 .argv; 
  
 if (argv.help) { 
 optimist.showHelp(); 
 process.exit(); 
 } 
  
 const server = require('../server')({ 
 max_tcp_sockets: argv['max-sockets'], 
 secure: argv.secure 
 }); 
  
 server.listen(argv.port, () => { 
 debug('server listening on port: %d', server.address().port); 
 }); 
  
 process.on('SIGINT', () => { 
 process.exit(); 
 }); 
  
 process.on('SIGTERM', () => { 
 process.exit(); 
 }); 
  
 // vim: ft=javascript 
