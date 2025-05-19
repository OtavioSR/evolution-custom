// ack-hook.js - Versão focada em DELIVERY_ACK
module.exports = function setupAckHook(client) {
  // Registra quando novas mensagens chegarem
  client.ev.on('messages.upsert', async (upsert) => {
    if (upsert.type === 'notify') {
      for (const msg of upsert.messages) {
        // Só processa mensagens que não são nossas
        if (!msg.key.fromMe) {
          console.log(`[ACK HOOK] Processando mensagem: ${msg.key.id} de ${msg.key.remoteJid}`);
          
          // Método específico para DELIVERY_ACK (duas setas cinzas)
          try {
            // Tenta enviar um ACK de tipo 3 (DELIVERY_ACK)
            await client.sendReceipt(
              msg.key.remoteJid,
              msg.key.participant || msg.key.remoteJid,
              [msg.key.id],
              'delivery'  // Tenta usar 'delivery' explicitamente
            );
            console.log(`[ACK HOOK] DELIVERY_ACK enviado para: ${msg.key.id}`);
          } catch (error1) {
            console.error('[ACK HOOK] Erro ao enviar DELIVERY_ACK:', error1);
            
            // Método alternativo
            try {
              // Tenta com o valor numérico 3 que corresponde a DELIVERY_ACK
              const deliveryAck = { tag: 'ack', attrs: { id: msg.key.id, to: msg.key.remoteJid, type: 'delivery' } };
              await client.sendNode(deliveryAck);
              console.log(`[ACK HOOK] DELIVERY_ACK via sendNode enviado para: ${msg.key.id}`);
            } catch (error2) {
              console.error('[ACK HOOK] Erro ao enviar DELIVERY_ACK via sendNode:', error2);
            }
          }
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
  
  console.log('[ACK HOOK] Hook específico para DELIVERY_ACK (duas setas cinzas) instalado com sucesso!');
  return client;
};
