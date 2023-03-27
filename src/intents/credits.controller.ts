import { Controller, Post, Get, Req, ForbiddenException} from '@nestjs/common';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

//////// Para generar llaves
const crypt = require("crypto");
const DER_SECRET_PREFIX = '302e020100300506032b657004220420';
const DER_PUBLIC_PREFIX = '302a300506032b6570032100';
////////

@Controller()
export class CreditsController {

    @Post('/credits/prepare-credit')
    prepareCredit(@Req() req: Request) {
        var cuerpo = req.body;

        //si el target no existe, manda error y en el bridge se debe llamar a /credits/abort-credit
        //Si el target existe variable existeTarget trae info, continua el proceso
        //Si target es wallet de telefono, se debe obtener el wallet de producto asociado
        var walletProducto;
        var producto
        if(cuerpo.target.includes("tel", 0)){
            //Se comenta la búsqueda del wallet en el ledger
 //           const urlValidaTarget = 'https://cardnet.ldg-stg.one/api/v2/wallets/'+cuerpo.target;
 //           const walletTarget =  axios({
 //               method: 'GET',
 //               url: urlValidaTarget,
 //           }).catch(() => {
 //               throw new ForbiddenException('API not available');
 //           });
            //A la variable walletProducto se le asigna el valor del wallet de producto asociado al wallet de teléfono walletTarget.routes[0].target
            var numeroProducto = Math.floor((Math.random() * (99999 - 1 + 1)) + 1);
            walletProducto = this.buscaHandlerWalletProducto('creditCard', numeroProducto);
            producto = this.obtieneDatosProducto(walletProducto);
        }else{
            producto = this.obtieneDatosProducto(cuerpo.target);
        }

        //Ya que se obtuviero los datos de la cuenta donde caeran los fondos (target)
        //Se integra con el core para preparar el producto y se notifica el monto que se depositara, se pasa el producto, symbol, amount
        //En el body viene el valor estatusIntent, de este valor dependen las validaciones que se hagan con el core y una vez que responda el core podra cambiar el valor de estatusIntent
        //El estatusIntent puede tomar los valores pending, prepared, failed dependiendo el paso en el que se encuentre
        var statusIntent = cuerpo.statusIntent;
        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(cuerpo.target);

        //Obtiene fecha actual
        const f = new Date();

        //Crea response
        var data = {
            handlerTransacccion: cuerpo.handlerTransacccion,
            source: cuerpo.source,
            target: cuerpo.target,
            amount: cuerpo.amount,
            symbol: cuerpo.symbol,
            action: 'prepare-credit',
            actionIntent: 'transfer',
            statusIntent: statusIntent,
            moment: f.toLocaleDateString(),
            schema: llaves.schema,
            llavePublica: llaves.publicRaw,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_PREPARE_CREDITS', descripcion: 'Se realizó el prepare-credit correctamente con estatus '+statusIntent}
        };

        return data;
    }

    @Post('/credits/commit-credit')
    commitCredit(@Req() req: Request) {
        var cuerpo = req.body;

        //si el target no existe, manda error y en el bridge se debe llamar a /credits/abort-credit
        //Si el target existe variable existeTarget trae info, continua el proceso
        //Si target es wallet de telefono, se debe obtener el wallet de producto asociado
        var walletProducto;
        var producto
        
        if(cuerpo.target.includes("tel", 0)){
            //Se comenta la búsqueda del wallet en el ledger
//            const urlValidaTarget = 'https://cardnet.ldg-stg.one/api/v2/wallets/'+cuerpo.target;
//            const walletTarget =  axios({
//                method: 'GET',
//                url: urlValidaTarget,
//            }).catch(() => {
//                throw new ForbiddenException('API not available');
//            });
            //A la variable walletProducto se le asigna el valor del wallet de producto asociado al wallet de teléfono walletTarget.routes[0].target
            var numeroProducto = Math.floor((Math.random() * (99999 - 1 + 1)) + 1);
            walletProducto = this.buscaHandlerWalletProducto('creditCard', numeroProducto);
            producto = this.obtieneDatosProducto(walletProducto);
        }else{
            producto = this.obtieneDatosProducto(cuerpo.target);
        }

        //Ya que se obtuviero los datos de la cuenta donde caeran los fondos (target)
        //Se integra con el core para realizar el deposito de los fondos, se pasa el producto, symbol, amount
        //En el body viene el valor estatusIntent, de este valor dependen las validaciones que se hagan con el core y una vez que responda el core podra cambiar el valor de estatusIntent
        //El estatusIntent puede tomar los valores committed, failed dependiendo el paso en el que se encuentre
        var statusIntent = cuerpo.statusIntent;
        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(cuerpo.target);

        //Obtiene fecha actual
        const f = new Date();

        //Crea response
        var data = {
            handlerTransacccion: cuerpo.handlerTransacccion,
            source: cuerpo.source,
            target: cuerpo.target,
            amount: cuerpo.amount,
            symbol: cuerpo.symbol,
            action: 'prepare-credit',
            actionIntent: 'transfer',
            statusIntent: statusIntent,
            moment: f.toLocaleDateString(),
            schema: llaves.schema,
            llavePublica: llaves.publicRaw,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_COMMIT_CREDITS', descripcion: 'Se realizó el commit-credit correctamente con estatus '+statusIntent}
        };

        return data;
    }

    @Post('/credits/abort-credit')
    abortCredit(@Req() req: Request) {
        var cuerpo = req.body;
        //si el target no existe, manda error y en el bridge se debe llamar a /credits/abort-credit
        //Si el target existe variable existeTarget trae info, continua el proceso
        //Si target es wallet de telefono, se debe obtener el wallet de producto asociado
        var walletProducto;
        var producto
        if(cuerpo.target.includes("tel", 0)){
            //Se comenta la búsqueda del wallet en el ledger
//            const urlValidaTarget = 'https://cardnet.ldg-stg.one/api/v2/wallets/'+cuerpo.target;
//            const walletTarget =  axios({
//                method: 'GET',
//                url: urlValidaTarget,
//            }).catch(() => {
//                throw new ForbiddenException('API not available');
//            });
            //A la variable walletProducto se le asigna el valor del wallet de producto asociado al wallet de teléfono walletTarget.routes[0].target
            var numeroProducto = Math.floor((Math.random() * (99999 - 1 + 1)) + 1);
            walletProducto = this.buscaHandlerWalletProducto('creditCard', numeroProducto);
            producto = this.obtieneDatosProducto(walletProducto);
        }else{
            producto = this.obtieneDatosProducto(cuerpo.target);
        }

        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(cuerpo.target);

        //Obtiene fecha actual
        const f = new Date();

        if(cuerpo.disparador === 'prepare-credit'){
            //Cuando el disparador es prepare-credit se debe validar que en la cuenta destino (target) no se haya realizado movimientos de esta transferencia handlerTransacccion
        }else{
            //Cuando el disparador es commit-credit aqui se debe devolver (descontar) el dinero en la cuenta destino (target) con los datos obtenidos en la variable producto
        }

        //Crea response
        var data = {
            handlerTransacccion: cuerpo.handlerTransacccion,
            source: cuerpo.source,
            target: cuerpo.target,
            amount: cuerpo.monto,
            symbol: cuerpo.moneda,
            action: 'abort-credit',
            statusAction: 'aborted',
            actionIntent: 'transfer',
            statusIntent: 'rejected',
            moment: f.toLocaleDateString(),
            schema: llaves.schema,
            llavePublica: llaves.publicRaw,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_ABORT_CREDITS', descripcion: 'Se realizó el abort-credit correctamente, se liberarón los fondos'}
        };

        return data;
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

    buscaHandlerWalletProducto(tipoProducto, numeroProducto){
        var handler = tipoProducto+':'+numeroProducto+'@Qik';
        return handler;
    }

    buscaHandlerWalletTelefono(numeroTelefono){
        var handler = 'tel:'+numeroTelefono;
        return handler;
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