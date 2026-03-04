const { initFunction } = require('buttons-warpper');

async function ButtonCreate(client, options = {}) {
  if (!client) throw new Error('Client Baileys diperlukan');
  
  await initFunction(client);

  const {
    formatButton: customFormatButton,
    onButtonSend,
    onButtonResponse,
    contextInfo: defaultContextInfo = {}
  } = options;

  const formatButton = customFormatButton || ((btn) => {
    const base = { name: 'quick_reply', params: { display_text: btn.buttonName || 'Button', id: btn.id } };
    if (btn.url) return { name: 'cta_url', params: { display_text: btn.buttonName, url: btn.url } };
    if (btn.copy_code) return { name: 'cta_copy', params: { display_text: btn.buttonName, copy_code: btn.copy_code } };
    if (btn.phone_number) return { name: 'cta_call', params: { display_text: btn.buttonName, phone_number: btn.phone_number } };
    if (btn.rows) return { name: 'single_select', params: { title: btn.title || 'Menu', sections: [{ rows: btn.rows }] } };
    return { ...base, params: { display_text: btn.buttonName, id: btn.id } };
  });

  client.sendButton = async (jid, content = {}, options = {}) => {
    const isString = typeof content === 'string';
    let {
      text = isString ? content : '', footer = '', title, subtitle,
      buttons = [],
      contextInfo = {}, mentions = [],
      ...rest
    } = isString ? {} : content;

    const formattedButtons = buttons.map(b => ({
      name: b.name || formatButton(b).name,
      buttonParamsJson: JSON.stringify(formatButton(b).params)
    }));

    if (onButtonSend) {
      await onButtonSend({ jid, content, buttons: formattedButtons, options });
    }

    const messageContent = {
      title, subtitle, text, footer,
      interactiveButtons: formattedButtons,
      contextInfo: {
        mentionedJid: mentions,
        ...defaultContextInfo,
        ...contextInfo
      },
      ...rest
    };

    return client.sendInteractiveMessage(jid, messageContent, { quoted: options.quoted });
  };

  const originalHandleResponse = client.handleButtonResponse || function(mek) {
    try {
      if (mek.mtype === 'buttonsResponseMessage') {
        const id = mek.message?.buttonsResponseMessage?.selectedButtonId;
        if (id) {
          mek.text = id;
          mek.body = id;
          mek.message.conversation = id;
        }
      }
      else if (mek.mtype === 'listResponseMessage') {
        const id = mek.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
        if (id) {
          mek.text = id;
          mek.body = id;
          mek.message.conversation = id;
        }
      }
      else if (mek.mtype === 'interactiveResponseMessage') {
        const raw = mek.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.id) {
            mek.text = data.id;
            mek.body = data.id;
            mek.message.conversation = data.id;
          }
        }
      }
      else if (mek.mtype === 'templateButtonReplyMessage') {
        const id = mek.message?.templateButtonReplyMessage?.selectedId;
        if (id) {
          mek.text = id;
          mek.body = id;
          mek.message.conversation = id;
        }
      }
    } catch (e) {}
    return mek;
  };

  client.handleButtonResponse = (mek) => {
    const result = originalHandleResponse(mek);
    if (onButtonResponse) {
      onButtonResponse(result);
    }
    return result;
  };

  return client;
}

function ButtonResponse(mek) {
  try {
    if (mek.mtype === 'buttonsResponseMessage') {
      const id = mek.message?.buttonsResponseMessage?.selectedButtonId;
      if (id) {
        mek.text = id;
        mek.body = id;
        mek.message.conversation = id;
      }
    }
    else if (mek.mtype === 'listResponseMessage') {
      const id = mek.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
      if (id) {
        mek.text = id;
        mek.body = id;
        mek.message.conversation = id;
      }
    }
    else if (mek.mtype === 'interactiveResponseMessage') {
      const raw = mek.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.id) {
          mek.text = data.id;
          mek.body = data.id;
          mek.message.conversation = data.id;
        }
      }
    }
    else if (mek.mtype === 'templateButtonReplyMessage') {
      const id = mek.message?.templateButtonReplyMessage?.selectedId;
      if (id) {
        mek.text = id;
        mek.body = id;
        mek.message.conversation = id;
      }
    }
  } catch (e) {}
  return mek;
}

module.exports = {
  ButtonCreate,
  ButtonResponse
};
