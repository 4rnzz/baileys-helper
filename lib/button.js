function buildInteractiveButtons(buttons = []) {
    return buttons.map((b, i) => {
        if (b && b.name && b.buttonParamsJson) return b;

        if (b && (b.id || b.text)) {
            return {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: b.text || b.displayText || 'Button ' + (i + 1),
                    id: b.id || ('quick_' + (i + 1))
                })
            };
        }

        if (b && b.buttonId && b.buttonText?.displayText) {
            return {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: b.buttonText.displayText,
                    id: b.buttonId
                })
            };
        }

        return b;
    });
}

class InteractiveValidationError extends Error {
    constructor(message, { context, errors = [], warnings = [], example } = {}) {
        super(message);
        this.name = 'InteractiveValidationError';
        this.context = context;
        this.errors = errors;
        this.warnings = warnings;
        this.example = example;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            context: this.context,
            errors: this.errors,
            warnings: this.warnings,
            example: this.example
        };
    }
}

function getButtonType(message) {
    if (message.listMessage) {
        return 'list';
    } else if (message.buttonsMessage) {
        return 'buttons';
    } else if (message.interactiveMessage?.nativeFlowMessage) {
        return 'native_flow';
    }
    return null;
}

function getButtonArgs(message) {
    const nativeFlow = message.interactiveMessage?.nativeFlowMessage;
    const firstButtonName = nativeFlow?.buttons?.[0]?.name;

    const nativeFlowSpecials = [
        'mpm', 'cta_catalog', 'send_location',
        'call_permission_request', 'wa_payment_transaction_details',
        'automated_greeting_message_view_catalog'
    ];

    if (nativeFlow && (firstButtonName === 'review_and_pay' || firstButtonName === 'payment_info')) {
        return {
            tag: 'biz',
            attrs: {
                native_flow_name: firstButtonName === 'review_and_pay' ? 'order_details' : firstButtonName
            }
        };
    } else if (nativeFlow && nativeFlowSpecials.includes(firstButtonName)) {
        return {
            tag: 'biz',
            attrs: {},
            content: [{
                tag: 'interactive',
                attrs: {
                    type: 'native_flow',
                    v: '1'
                },
                content: [{
                    tag: 'native_flow',
                    attrs: {
                        v: '2',
                        name: firstButtonName
                    }
                }]
            }]
        };
    } else if (nativeFlow || message.buttonsMessage) {
        return {
            tag: 'biz',
            attrs: {},
            content: [{
                tag: 'interactive',
                attrs: {
                    type: 'native_flow',
                    v: '1'
                },
                content: [{
                    tag: 'native_flow',
                    attrs: {
                        v: '9',
                        name: 'mixed'
                    }
                }]
            }]
        };
    } else if (message.listMessage) {
        return {
            tag: 'biz',
            attrs: {},
            content: [{
                tag: 'list',
                attrs: {
                    v: '2',
                    type: 'product_list'
                }
            }]
        };
    } else {
        return {
            tag: 'biz',
            attrs: {}
        };
    }
}

function prepareMessageContent(options) {
    const content = {};
    
    if (options.text && !options.image && !options.video && !options.document && !options.audio && !options.sticker) {
        content.conversation = options.text;
    }

    if (options.image) {
        content.imageMessage = {
            url: options.image.url,
            mimetype: options.mimetype || 'image/jpeg',
            caption: options.caption || options.text || '',
            ...(options.contextInfo && { contextInfo: options.contextInfo })
        };
    }

    if (options.video) {
        content.videoMessage = {
            url: options.video.url,
            mimetype: options.mimetype || 'video/mp4',
            caption: options.caption || options.text || '',
            ...(options.contextInfo && { contextInfo: options.contextInfo })
        };
    }

    if (options.document) {
        content.documentMessage = {
            url: options.document.url,
            mimetype: options.mimetype || 'application/pdf',
            title: options.title || 'Document',
            fileName: options.fileName || 'document.pdf',
            caption: options.caption || options.text || '',
            ...(options.contextInfo && { contextInfo: options.contextInfo })
        };
    }

    if (options.audio) {
        content.audioMessage = {
            url: options.audio.url,
            mimetype: options.mimetype || 'audio/mp4',
            ...(options.ptt && { ptt: true }),
            ...(options.contextInfo && { contextInfo: options.contextInfo })
        };
    }

    if (options.sticker) {
        content.stickerMessage = {
            url: options.sticker.url,
            ...(options.contextInfo && { contextInfo: options.contextInfo })
        };
    }

    return content;
}

function createInteractiveMessage(options) {
    const interactiveMessage = {
        nativeFlowMessage: {
            buttons: buildInteractiveButtons(options.buttons || []).map(btn => ({
                name: btn.name || 'quick_reply',
                buttonParamsJson: btn.buttonParamsJson
            }))
        }
    };

    if (options.text && (options.image || options.video || options.document || options.audio || options.sticker)) {
        interactiveMessage.body = { text: options.caption || options.text };
    } else if (options.text) {
        interactiveMessage.body = { text: options.text };
    }

    if (options.footer) {
        interactiveMessage.footer = { text: options.footer };
    }

    if (options.title) {
        interactiveMessage.header = { title: options.title };
    }

    return interactiveMessage;
}

async function sendInteractiveMessage(sock, jid, content, options = {}) {
    if (!sock) {
        throw new InteractiveValidationError('Socket is required', { context: 'sendInteractiveMessage' });
    }

    let generateWAMessageFromContent, relayMessage, normalizeMessageContent, isJidGroup, generateMessageIDV2;
    const candidatePkgs = ['baileys', '@whiskeysockets/baileys', '@adiwajshing/baileys'];
    let loaded = false;

    for (const pkg of candidatePkgs) {
        if (loaded) break;
        try {
            const mod = require(pkg);
            generateWAMessageFromContent = mod.generateWAMessageFromContent || mod.Utils?.generateWAMessageFromContent;
            normalizeMessageContent = mod.normalizeMessageContent || mod.Utils?.normalizeMessageContent;
            isJidGroup = mod.isJidGroup || mod.WABinary?.isJidGroup;
            generateMessageIDV2 = mod.generateMessageIDV2 || mod.Utils?.generateMessageIDV2 || mod.generateMessageID || mod.Utils?.generateMessageID;
            relayMessage = sock.relayMessage;
            if (generateWAMessageFromContent && normalizeMessageContent && isJidGroup && relayMessage) {
                loaded = true;
            }
        } catch (_) { }
    }

    if (!loaded) {
        throw new InteractiveValidationError('Missing baileys internals', {
            context: 'sendInteractiveMessage.dynamicImport',
            errors: ['Required functions not found in installed packages']
        });
    }

    const userJid = sock.authState?.creds?.me?.id || sock.user?.id;
    const fullMsg = generateWAMessageFromContent(jid, content, {
        logger: sock.logger,
        userJid,
        messageId: generateMessageIDV2(userJid),
        timestamp: new Date(),
        ...options
    });

    const normalizedContent = normalizeMessageContent(fullMsg.message);
    const buttonType = getButtonType(normalizedContent);
    let additionalNodes = [...(options.additionalNodes || [])];

    if (buttonType) {
        const buttonsNode = getButtonArgs(normalizedContent);
        const isPrivate = !isJidGroup(jid);
        additionalNodes.push(buttonsNode);
        if (isPrivate) {
            additionalNodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
        }
    }

    if (options.quoted) {
        if (!additionalNodes.some(n => n.tag === 'quoted')) {
            additionalNodes.push({
                tag: 'quoted',
                attrs: {
                    'participant': options.quoted.key.participant || options.quoted.key.remoteJid,
                    'stanza-id': options.quoted.key.id
                }
            });
        }
    }

    await relayMessage(jid, fullMsg.message, {
        messageId: fullMsg.key.id,
        useCachedGroupMetadata: options.useCachedGroupMetadata,
        additionalAttributes: options.additionalAttributes || {},
        statusJidList: options.statusJidList,
        additionalNodes
    });

    return fullMsg;
}

function sendButton(jid, options = {}) {
    if (!this) {
        throw new InteractiveValidationError('Socket instance required. Use: sock.sendButton(jid, options)');
    }

    const sock = this;
    const { buttons = [], quoted, ...rest } = options;

    if (!buttons || buttons.length === 0) {
        throw new InteractiveValidationError('Buttons array is required', {
            context: 'sendButton',
            example: { buttons: [{ id: 'btn1', text: 'Button 1' }] }
        });
    }

    const mediaContent = prepareMessageContent(rest);
    const interactiveMessage = createInteractiveMessage({ ...rest, buttons });

    let finalContent;
    if (Object.keys(mediaContent).length > 0) {
        const mediaType = Object.keys(mediaContent)[0];
        finalContent = {
            [mediaType]: mediaContent[mediaType],
            interactiveMessage: interactiveMessage
        };
        
        if (mediaContent[mediaType].caption && interactiveMessage.body) {
            delete interactiveMessage.body;
        }
    } else {
        finalContent = {
            conversation: rest.text || '',
            interactiveMessage: interactiveMessage
        };
    }

    const sendOptions = {};
    if (quoted) {
        sendOptions.quoted = quoted;
    }
    if (rest.contextInfo) {
        sendOptions.contextInfo = rest.contextInfo;
    }

    return sendInteractiveMessage(sock, jid, finalContent, sendOptions);
}

module.exports = (sock) => {
    sock.sendButton = sendButton;
    return {
        sendButton: sendButton.bind(sock),
        sendInteractiveMessage: (jid, content, options) => sendInteractiveMessage(sock, jid, content, options),
        InteractiveValidationError,
        getButtonType,
        getButtonArgs
    };
};

module.exports.sendButton = sendButton;
module.exports.sendInteractiveMessage = sendInteractiveMessage;
module.exports.InteractiveValidationError = InteractiveValidationError;
module.exports.getButtonType = getButtonType;
module.exports.getButtonArgs = getButtonArgs;
