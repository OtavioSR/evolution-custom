// ack-hook.js - Versão avançada com múltiplos métodos
module.exports = function setupAckHook(client) {
  // Registra quando novas mensagens chegarem
  client.ev.on('messages.upsert', async (upsert) => {
    if (upsert.type === 'notify') {
      for (const msg of upsert.messages) {
        // Só processa mensagens que não são nossas
        if (!msg.key.fromMe) {
          console.log(`[ACK HOOK] Processando mensagem: ${msg.key.id} de ${msg.key.remoteJid}`);
          
          // Método 1: sendReceipt com 'sender'
          try {
            await client.sendReceipt(
              msg.key.remoteJid,
              msg.key.participant || msg.key.remoteJid,
              [msg.key.id],
              'sender'
            );
            console.log(`[ACK HOOK] ACK 'sender' enviado para: ${msg.key.id}`);
          } catch (error1) {
            console.error('[ACK HOOK] Erro ao enviar ACK sender:', error1);
          }
          
          // Método 2: sendReceipt com 'receipt'
          try {
            await client.sendReceipt(
              msg.key.remoteJid,
              msg.key.participant || msg.key.remoteJid,
              [msg.key.id],
              'receipt'
            );
            console.log(`[ACK HOOK] ACK 'receipt' enviado para: ${msg.key.id}`);
          } catch (error2) {
            console.error('[ACK HOOK] Erro ao enviar ACK receipt:', error2);
          }
          
          // Método 3: readMessages
          try {
            await client.readMessages([msg.key]);
            console.log(`[ACK HOOK] readMessages enviado para: ${msg.key.id}`);
          } catch (error3) {
            console.error('[ACK HOOK] Erro ao enviar readMessages:', error3);
          }
          
          // Método 4: protocolMessage direto
          try {
            await client.sendMessage(msg.key.remoteJid, { 
              protocolMessage: {
                type: 3, // ACKNOWLEDGEMENT
                key: msg.key
              }
            });
            console.log(`[ACK HOOK] protocolMessage enviado para: ${msg.key.id}`);
          } catch (error4) {
            console.error('[ACK HOOK] Erro ao enviar protocolMessage:', error4);
          }
          
          // Método 5: Socket direto
          try {
            if (client.ws) {
              const node = {
                tag: 'receipt',
                attrs: {
                  id: msg.key.id,
                  type: 'receipt',
                  to: msg.key.remoteJid,
                  participant: msg.key.participant
                }
              };
              
              await client.ws.sendNode(node);
              console.log(`[ACK HOOK] Socket direto enviado para: ${msg.key.id}`);
            }
          } catch (error5) {
            console.error('[ACK HOOK] Erro ao enviar via socket direto:', error5);
          }
        }
      }
    }
  });
  
  console.log('[ACK HOOK] Hook avançado de confirmação de entrega instalado com sucesso!');
  return client;
};
