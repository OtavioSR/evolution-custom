// ack-hook.js - Versão que evita marcar como lido
module.exports = function setupAckHook(client) {
  // Registra quando novas mensagens chegarem
  client.ev.on('messages.upsert', async (upsert) => {
    if (upsert.type === 'notify') {
      for (const msg of upsert.messages) {
        // Só processa mensagens que não são nossas
        if (!msg.key.fromMe) {
          console.log(`[ACK HOOK] Processando mensagem: ${msg.key.id} de ${msg.key.remoteJid}`);
          
          // Método 1: sendReceipt com 'sender' (apenas confirmação de entrega)
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
            
            // Método 2: sendReceipt com 'receipt' (apenas confirmação de entrega)
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
          }
          
          // NÃO use readMessages, pois isso marca como lido (setas azuis)
          // NÃO use protocolMessage, pois está causando erro
        }
      }
    }
  });
  
  // Desativar a leitura automática de mensagens
  const originalReadMessages = client.readMessages;
  client.readMessages = function(keys) {
    console.log('[ACK HOOK] Bloqueando leitura automática de mensagens');
    return Promise.resolve(); // Não faz nada
  };
  
  console.log('[ACK HOOK] Hook de confirmação de entrega (apenas setas cinzas) instalado com sucesso!');
  return client;
};
