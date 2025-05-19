// ack-hook.js
module.exports = function setupAckHook(client) {
  // Registra quando novas mensagens chegarem
  client.ev.on('messages.upsert', async (upsert) => {
    if (upsert.type === 'notify') {
      for (const msg of upsert.messages) {
        // Só processa mensagens que não são nossas
        if (!msg.key.fromMe) {
          try {
            console.log(`[ACK HOOK] Enviando ACK para mensagem: ${msg.key.id}`);
            
            // Método 1: Usando sendReceipt
            await client.sendReceipt(
              msg.key.remoteJid,
              msg.key.participant || msg.key.remoteJid,
              [msg.key.id],
              'receipt'
            );
            console.log(`[ACK HOOK] ACK enviado com sucesso para: ${msg.key.id}`);
          } catch (error) {
            console.error('[ACK HOOK] Erro ao enviar ACK:', error);
            
            // Método 2: Tentativa alternativa usando o socket diretamente
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
                console.log(`[ACK HOOK] ACK alternativo enviado para: ${msg.key.id}`);
              }
            } catch (error2) {
              console.error('[ACK HOOK] Erro ao enviar ACK alternativo:', error2);
            }
          }
        }
      }
    }
  });
  
  console.log('[ACK HOOK] Hook de confirmação de entrega instalado com sucesso!');
  return client;
};
