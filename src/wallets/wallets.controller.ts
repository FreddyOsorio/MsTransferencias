import { Controller, Post, Get, Req} from '@nestjs/common';
import { Request } from 'express';

//////// Para generar llaves
const crypt = require("crypto");
const DER_SECRET_PREFIX = '302e020100300506032b657004220420';
const DER_PUBLIC_PREFIX = '302a300506032b6570032100';
////////

@Controller()
export class WalletsController {
    @Get('/obtieneWalletProducto')
    getWalletProducto(@Req() req: Request) {
        var cuerpo = req.body;
        //Obtiene Wallet de producto
        var handlerWalletProducto = this.buscaHandlerWalletProducto(cuerpo.tipoProducto, cuerpo.numeroProducto);
        //Obtiene llaves del wallet de producto
        var llavesWalletProducto = this.getLlavesXNombre(handlerWalletProducto);
        //Obtiene handler de bridge (Puede ser una variable de entorno)
        var handlerBridge = 'bridge_prod@Qik';

        var data = {
            handlerWallet: handlerWalletProducto,
            llavePublica: llavesWalletProducto.publicRaw,
            schema: llavesWalletProducto.schema,
            handlerBridge: handlerBridge,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_BUSCAR_WALLET_PRODUCTO', descripcion: 'Se buscó el wallet correctamente'}
        };
        return data;
    }

    @Get('/obtieneWalletTelefono')
    getWalletTelefono(@Req() req: Request) {
        var cuerpo = req.body;
        //Obtiene Wallet de telefono
        var handlerWalletTelefono = this.buscaHandlerWalletTelefono(cuerpo.numeroTelefono);
        //Obtiene llaves del wallet de telefono
        var llavesWalletTelefono = this.getLlavesXNombre(handlerWalletTelefono);
         //Obtiene Wallet de producto
        var handlerWalletProducto = this.buscaHandlerWalletProducto(cuerpo.tipoProducto, cuerpo.numeroProducto);
        //Obtiene handler de bridge (Puede ser una variable de entorno)
        var handlerBridge = 'bridge_prod@Qik';

        var data = {
            handlerWalletTelefono: handlerWalletTelefono,
            llavePublica: llavesWalletTelefono.publicRaw,
            schema: llavesWalletTelefono.schema,
            handlerBridge: handlerBridge,
            handlerWalletProducto: handlerWalletProducto,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_BUSCAR_WALLET_TELEFONO', descripcion: 'Se buscó el wallet correctamente'}
        };
        return data;
    }

    @Post('/generaWalletProducto')
    generaWalletProducto(@Req() req: Request) {
        var cuerpo = req.body;
        //Crea handlerWallet
        var handlerWallet = this.creaHandlerWalletProducto(cuerpo.tipoProducto, cuerpo.numeroProducto);
        //Obtiene handler de bridge (Puede ser una variable de entorno)
        var handlerBridge = 'bridge_prod@Qik';
        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(handlerWallet);
        //Obtiene fecha actual
        const f = new Date();

        //Crea response
        var data = {
            handlerWallet: handlerWallet,
            llavePublica: llaves.publicRaw,
            schema: llaves.schema,
            handlerBridge: handlerBridge,
            fecha: f.toLocaleDateString(),
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_CREAR_WALLET_PRODUCTO', descripcion: 'Se genero el wallet correctamente'}
        };
        return data;
    }

    @Post('/generaWalletTelefono')
    generaWalletTelefono(@Req() req: Request) {
        var cuerpo = req.body;
        //Busca el handlerWalletProducto si no existe lo crea
        var existe = true;
        var handlerWalletProducto;
        if(existe){
            handlerWalletProducto = this.buscaHandlerWalletProducto(cuerpo.tipoProducto, cuerpo.numeroProducto);
        }else{
            handlerWalletProducto = this.creaHandlerWalletProducto(cuerpo.tipoProducto, cuerpo.numeroProducto);
        }
        //Crea HandlerWalletTelefono
        var handlerWalletTelefono = this.creaHandlerWalletTelefono(cuerpo.numeroTelefono);
        //Obtiene handler de bridge (Puede ser una variable de entorno)
        var handlerBridge = 'bridge_prod@Qik';
        //Obtiene llave pública y schema
        var llaves =  this.getLlavesXNombre(handlerWalletTelefono);
        //Obtiene fecha actual
        const f = new Date();

        //Crea response
        var data = {
            handlerWalletTelefono: handlerWalletTelefono,
            llavePublica: llaves.publicRaw,
            schema: llaves.schema,
            handlerBridge: handlerBridge,
            handlerWalletProducto: handlerWalletProducto,
            fecha: f.toLocaleDateString(),
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_CREAR_WALLET_PRODUCTO', descripcion: 'Se genero el wallet correctamente'}
        };
        return data;
    }

    creaHandlerWalletProducto(tipoProducto, numeroProducto){
        var handler = tipoProducto+':'+numeroProducto+'@Qik';
        return handler;
    }

    buscaHandlerWalletProducto(tipoProducto, numeroProducto){
        var handler = tipoProducto+':'+numeroProducto+'@Qik';
        return handler;
    }

    creaHandlerWalletTelefono(numeroTelefono){
        var handler = 'tel:'+numeroTelefono;
        return handler;
    }

    buscaHandlerWalletTelefono(numeroTelefono){
        var handler = 'tel:'+numeroTelefono;
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
}