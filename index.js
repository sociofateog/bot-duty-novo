const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const axios = require('axios');

// Inisialisasi Client Discord Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel] 
});

// Mengambil variabel lingkungan dari Railway
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID; 
const INTERACTION_CHANNEL_ID = process.env.INTERACTION_CHANNEL_ID || '1463961470344757336'; 

// List pesan gombalan dan sapaan acak (Terbaru: 30 Kata-kata)
const INTERACTION_MESSAGES = [
    "Aduh {user}, kamu tau gak bedanya kamu sama shift duty? Kalo duty ada selesainya, kalo cintaku ke kamu gak ada selesainya~ 🙈💖",
    "Udah berapa lama duty-nya hari ini {user}? Jangan kecapekan dong, nanti siapa yang nemenin aku di masa depan? 🥹✨",
    "Semangat ya kerjanya {user}! Jangan lupa minum air putih, biar tetep manis kaya senyuman kamu ke aku 🥤😉",
    "Ehem... {user} kamu punya peta gak? Aku tersesat nih di dalam indahnya mata kamu~ 😚🌸",
    "Halo ganteng/cantik {user}, duty mulu deh... Kapan dong waktu untuk mencintai aku sepenuhnya? 🥹👉👈",
    "{user} kamu tau gak kenapa bintang malam ini redup? Soalnya kalah terang sama pesona kamu! 💅✨",
    "Kerja yang rajin ya {user}! Nanti kalo udah sukses, langsung lamar aku ya! 🧋💕",
    "Capek ya {user}? Sini-sini aku peluk biar rasa capeknya pindah jadi rasa sayang~ 🥰✨",
    "{user} kamu itu kaya Wi-Fi deh, soalnya aku langsung merasa 'connected' tiap liat kamu~ 🤭💖",
    "Fokus banget sih {user} dari tadi, lirih-lirih aku dikit napa... Aku kan juga butuh perhatian kamu 🥺👉👈",
    "Beli baju warna merah, {user} emang yang paling bikin hatiku merona deh hari ini! 🔥✨",
    "Lagi mikirin apa sih {user}? Mending mikirin gimana cara menata masa depan kita berdua! 🫣💗",
    "Semangat terus {user}! Kalo butuh sandaran, bahu dan hatiku selalu terbuka buat kamu~ 😉💅",
    "Hari ini kamu keliatan makin manis deh {user}, pantesan semut pada ngumpul! 😍✨",
    "Jangan lupa makan ya {user}, aku ga mau kamu sakit... Nanti hatiku juga ikut sakit tau! 🥺💔",
    "Ssstt... {user}, kerjaannya jangan terlalu diseriusin, mending seriusin hubungan kita aja~ 🤭✨",
    "Lagi keliling duty ya {user}? Awas jatuh, tapi kalau jatuhnya ke hatiku sih gak apa-apa~ 🥹💕",
    "Duh, mataku langsung adem banget begitu liat {user} muncul di sini! 🌸✨",
    "{user} kamu punya pemadam kebakaran gak? Soalnya kamu berhasil membakar api cinta di hatiku! 😋💅",
    "Semangat ya {user}! Inget, ada aku yang selalu merindukanmu dari jauh~ 🥰✨",
    "Kalo duty-nya udah kelar, bales chat aku ya {user}! Nanti aku kangennya makin berabe! 🥺👉👈",
    "Ihh {user} kamu itu kaya kopi deh, bikin aku ga bisa tidur karena ketagihan mikirin kamu! ☕💕",
    "Kerja mulu {user}, ga ada niatan buat ngebahagiain aku gitu? 🫣✨",
    "Semangat terus ya darling {user}! Kamu tuh alasan aku tersenyum hari ini! 💖🔥",
    "Duh {user}, pesona kamu meluap-luap deh hari ini, tolong dikondisikan ya bikin hatiku deg-degan mulu! 🙈✨",
    "{user} tau gak bedanya kamu sama AC? AC pendingin ruangan, kalau kamu pendingin hatiku yang lagi gundah~ 🍦😉",
    "Lagi kerja ya {user}? Ya udah deh aku pandangin aja foto kamu biar tambah semangat~ 🥰✨",
    "{user} kamu cape gak sih? Dari tadi malam kamu lari-lari terus di pikiran aku tau! 🏃‍♂️💨",
    "Kamu tau gak {user}, rumah apa yang paling indah? RUMAH tangga kita nanti~ 🏠💖",
    "Satu tambah satu sama dengan dua, aku tambah kamu sama dengan bahagia selamanya! {user} 😘✨"
];

// Fungsi untuk memilih member acak & mengirim pesan interaksi
async function sendRandomInteraction(channel) {
    try {
        if (!channel || !channel.guild) return;

        const members = await channel.guild.members.fetch();
        const nonBotMembers = members.filter(member => !member.user.bot);

        if (nonBotMembers.size === 0) return;

        const randomMember = nonBotMembers.random();
        const randomTemplate = INTERACTION_MESSAGES[Math.floor(Math.random() * INTERACTION_MESSAGES.length)];
        const messageToSend = randomTemplate.replace('{user}', `<@${randomMember.id}>`);

        await channel.send(messageToSend);
    } catch (error) {
        console.error("Gagal mengirim interaksi acak:", error);
    }
}

// Event saat Bot On
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Bot Duty Mekanik Aktif! Logged in as ${readyClient.user.tag}`);

    // Penjadwalan Otomatis 3 Jam Sekali (Antara 06:00 - 23:59 WIB)
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    setInterval(async () => {
        try {
            const now = new Date();
            const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false };
            const currentHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now), 10);

            if (currentHour >= 6 && currentHour <= 23) {
                const channel = await client.channels.fetch(INTERACTION_CHANNEL_ID);
                if (channel) {
                    await sendRandomInteraction(channel);
                }
            }
        } catch (err) {
            console.error("Error pada penjadwalan otomatis:", err);
        }
    }, THREE_HOURS);
});

// Handling Pesan & Command Discord
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const command = message.content.trim().toLowerCase();

    // ----------------------------------------------------
    // FITUR MANUAL COMMAND: !novo
    // ----------------------------------------------------
    if (command === '!novo') {
        const targetChannel = await client.channels.fetch(INTERACTION_CHANNEL_ID).catch(() => message.channel);
        await sendRandomInteraction(targetChannel);
        return;
    }

    // ----------------------------------------------------
    // FITUR DUTY MEKANIK (!on, !off, !list, !reset / !restart)
    // ----------------------------------------------------
    if (message.channel.id !== TARGET_CHANNEL_ID) return;

    if (['!on', '!off', '!list', '!reset', '!restart'].includes(command)) {
        await message.channel.sendTyping();

        let actionType = command.replace('!', '');
        if (actionType === 'restart') actionType = 'reset';

        // Ambil Display Name (Nickname server / Nama Profil Discord)
        const displayName = message.member?.displayName || message.author.globalName || message.author.username;

        try {
            const response = await axios.post(APPS_SCRIPT_URL, {
                action: actionType,
                userId: message.author.id,
                username: displayName
            });

            const data = response.data;

            if (actionType === 'on') {
                if (data === 'Ok') {
                    return message.reply(`✅ **${displayName}** berhasil **ON DUTY**! Selamat bekerja.`);
                }
            } else if (actionType === 'off') {
                if (data === 'BelumOn') {
                    return message.reply(`⚠️ Kamu belum **ON DUTY** sebelumnya! Ketik \`!on\` dulu ya.`);
                } else {
                    return message.reply(`🔴 **${displayName}** telah **OFF DUTY**.\n⏱️ Durasi duty sesi ini: **${data} Menit**.`);
                }
            } else if (actionType === 'list') {
                let listText = typeof data === 'string' ? data : JSON.stringify(data);
                
                if (listText.length > 1900) {
                    listText = listText.substring(0, 1900) + '\n*(Data dipotong karena terlalu panjang)*';
                }
                return message.channel.send(`📋 **Daftar Durasi Mekanik:**\n${listText}`);
            } else if (actionType === 'reset') {
                return message.reply(`🔄 Data duty semua mekanik berhasil di-**RESET**!`);
            }

        } catch (error) {
            console.error("Error pada Apps Script:", error);
            return message.reply('❌ Terjadi kesalahan saat berkomunikasi dengan database Google Sheets.');
        }
    }
});

// Login Bot
client.login(process.env.DISCORD_TOKEN);
