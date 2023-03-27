import { Controller, Post, Get, Req} from '@nestjs/common';
import { Request } from 'express';
import {v4 as uuidv4} from 'uuid';

//////// Para generar llaves
const crypt = require("crypto");
const DER_SECRET_PREFIX = '302e020100300506032b657004220420';
const DER_PUBLIC_PREFIX = '302a300506032b6570032100';
////////

@Controller()
export class DebitsController {

    @Post('/debits/prepare-debit')
    prepareDebit(@Req() req: Request) {
        var cuerpo = req.body;
        //Si numeroTelefono no  tiene valor, obtiene el handler del producto
        var existeHandlerTelefono =   Math.floor((Math.random() * (999 - 1 + 1)) + 1);
        var handlerSource;
        if(existeHandlerTelefono < 400){
            handlerSource = this.buscaHandlerWalletTelefono(cuerpo.numeroTelefono);
        }else{
            handlerSource = this.buscaHandlerWalletProducto(cuerpo.tipoProducto, cuerpo.numeroProducto);
        }
        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(handlerSource);
        //Obtiene handler del target
        var target = this.buscaHandlerTarget(cuerpo.cuentaDestino);
        //Obtiene fecha actual
        const f = new Date();
        //Obtiene handler de intent
        let myuuid = uuidv4();
        var handlerTransacccion = handlerSource+'_'+target+'_'+myuuid;

        //Aqui se debe apaartar el dinero en la cuenta origen (source)
        
        //Crea response
        var data = {
            handlerTransacccion: handlerTransacccion,
            source: handlerSource,
            target: target,
            amount: cuerpo.monto,
            symbol: cuerpo.moneda,
            action: 'prepare-debit',
            actionIntent: 'transfer',
            statusIntent: 'pending',
            moment: f.toLocaleDateString(),
            schema: llaves.schema,
            llavePublica: llaves.publicRaw,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_PREPARE_DEBITS', descripcion: 'Se realizó el prepare-debit correctamente'}
        };

        return data;
    }

    @Post('/debits/commit-debit')
    commitDebit(@Req() req: Request) {
        var cuerpo = req.body;

        //Aqui se debe recuperar el último estatus de la transacción con handlerTransacccion
        
        var producto
        //Con source obtiene los datos de la cuenta origen para generar la salida del dinero de esta cuenta, si el source es un wallet telefonico, busca el wallet de producto asociado a este
        if(cuerpo.source.includes("tel", 0)){
            var numeroProducto = Math.floor((Math.random() * (99999 - 1 + 1)) + 1);
            producto = this.buscaHandlerWalletProducto('creditCard', numeroProducto);
        }else{
            producto = this.obtieneDatosProducto(cuerpo.source);
        }

        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(cuerpo.source);

        //Obtiene fecha actual
        const f = new Date();

        //Aqui se debe descontar el dinero en la cuenta origen (source) con los datos obtenidos en la variable producto
        
        //Crea response
        var data = {
            handlerTransacccion: cuerpo.handlerTransacccion,
            source: cuerpo.source,
            target: cuerpo.target,
            amount: cuerpo.monto,
            symbol: cuerpo.moneda,
            action: 'commit-debit',
            actionIntent: 'transfer',
            statusIntent: 'committed',
            moment: f.toLocaleDateString(),
            schema: llaves.schema,
            llavePublica: llaves.publicRaw,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_COMMIT_DEBITS', descripcion: 'Se realizó el commit-debit correctamente'}
        };

        return data;
    }

    @Post('/debits/abort-debit')
    abortDebit(@Req() req: Request) {
        var cuerpo = req.body;

        //Aqui se debe recuperar el último estatus de la transacción con handlerTransacccion
        
        var producto
        //Con source obtiene los datos de la cuenta origen para generar la salida del dinero de esta cuenta, si el source es un wallet telefonico, busca el wallet de producto asociado a este
        if(cuerpo.source.includes("tel", 0)){
            var numeroProducto = Math.floor((Math.random() * (99999 - 1 + 1)) + 1);
            producto = this.buscaHandlerWalletProducto('creditCard', numeroProducto);
        }else{
            producto = this.obtieneDatosProducto(cuerpo.source);
        }
        //console.log("producto ", producto)
        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(cuerpo.source);

        //Obtiene fecha actual
        const f = new Date();

        //console.log("disparador ", cuerpo.disparador)
        if(cuerpo.disparador === 'prepare-debit'){
            //Cuando el disparador es prepare-debit se debe validar que en la cuenta origen (source) no se haya realizado movimientos de esta transferencia handlerTransacccion
        }else{
            //Cuando el disparador es commit-debit aqui se debe liberar el dinero en la cuenta origen (source) con los datos obtenidos en la variable producto
        }
        
        
        //Crea response
        var data = {
            handlerTransacccion: cuerpo.handlerTransacccion,
            source: cuerpo.source,
            target: cuerpo.target,
            amount: cuerpo.monto,
            symbol: cuerpo.moneda,
            action: 'abort-debit',
            statusAction: 'aborted',
            actionIntent: 'transfer',
            statusIntent: 'rejected',
            moment: f.toLocaleDateString(),
            schema: llaves.schema,
            llavePublica: llaves.publicRaw,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_ABORT_DEBITS', descripcion: 'Se realizó el abort-debit correctamente, se liberarón los fondos'}
        };

        return data;
    }


    buscaHandlerWalletProducto(tipoProducto, numeroProducto){
        var handler = tipoProducto+':'+numeroProducto+'@Qik';
        return handler;
    }

    buscaHandlerWalletTelefono(numeroTelefono){
        var handler = 'tel:'+numeroTelefono;
        return handler;
    }

    buscaHandlerTarget(cuentaDestino){
        //Aqui va al core y obtiene los datos del beneficiario, es decir, los datos de la cuenta a la que se realizara la transferencia
        var idtipoProducto = this.obtieneModDeAleatorio(); 
        var tipoProducto;
        var numeroProducto =  Math.floor((Math.random() * (999999 - 1 + 1)) + 1);
        var idBanco = this.obtieneModDeAleatorio();
        var banco;

        if(idtipoProducto > 0.5){
            tipoProducto = 'creditCard';
        }else{
            tipoProducto = 'debitCard';
        }
        if(idBanco < 0.6){
            banco = 'BPD';
        }else{
            banco = 'BPD_2';
        }
        var handler = tipoProducto+':'+numeroProducto+'@'+banco;
        return handler;
    }

    //Metódo que busca las llaves
    getLlavesXNombre(nombreLlave){

        //Aqui debe obtener de KMS las llaves por el nombrede la llave 
        var keyPair = this.generateLedgerKeyPair();
        return {
            nombreLlave: nombreLlave,
             publicRaw: keyPair.publicRaw,
             schema: keyPair.schema
           };
    }

    //Metódo que genera las Llaves
    generateLedgerKeyPair() {
        // Generate random ed25519 keys
        const keyPairDer = crypt.generateKeyPairSync("ed25519");
      
        // Export secret and public keys in der format
        const secretDer = keyPairDer.privateKey
          .export({ format: "der", type: "pkcs8" })
          .toString("hex");
      
        const publicDer = keyPairDer.publicKey
          .export({ format: "der", type: "spki" })
          .toString("hex");
      
          const secretRaw = Buffer.from(
            secretDer.slice(DER_SECRET_PREFIX.length),
            'hex',
          ).toString('base64')
          
          const publicRaw = Buffer.from(
            publicDer.slice(DER_PUBLIC_PREFIX.length),
            'hex',
          ).toString('base64')
        
        return {
         schema: "ed25519",
          secretRaw,
          publicRaw
        };
    }

    obtieneModDeAleatorio(){
        var aleatorio = Math.random();
        var resto = +aleatorio % 2;
        return resto;
    }

    obtieneDatosProducto(handlerSource){
        var posicionPuntos = handlerSource.indexOf(':');
        var posicionArroba = handlerSource.indexOf('@');
        return{
            producto: handlerSource.substring(0,posicionPuntos) ,
            numeroProducto: handlerSource.substring(posicionPuntos+1, posicionArroba),
            banco: handlerSource.substring(posicionArroba+1, handlerSource.length)
        }
    }
}