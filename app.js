require('dotenv').config();
const axios = require('axios');
const BootBot = require('bootbot');

const bot = new BootBot({
	accessToken: process.env.FB_ACCESS_TOKEN,
	verifyToken: process.env.FB_VERIFY_TOKEN,
	appSecret: process.env.FB_APP_SECRET,
});

bot.on('message', async (payload, chat) => {
	const text = payload.message.text;
	chat.say(await templateSearch(text.toLowerCase()), { typing: true });
});

bot.on('postback', async (payload, chat) => {
	const args = JSON.parse(payload.postback.payload);
	if (args.type === `VIEW_MORE`) chat.say(await templateSearch(args.query, args.offset), { typing: true });
});

bot.start();

// ./helpers/api

async function searchApi(query, offset, limit) {
	const endpoint = 'https://swiftgift.me/api/v2';
	return axios.get(`${endpoint}/products?search=${query}&page=${offset}&per_page=${limit}`).then(res => res.data);
}

// ./helpers/templates

const templateSearch = async (query, offset = 0, limit = 4) => {
	const searchResult = await search(query, offset, limit);
	if (searchResult.collection.length < 1) return 'Nothing Found Sorry, no products matched your criteria';
	return {
		elements: searchResult.collection.map(i => ({
			title: i.name,
			subtitle: `${i.lowest_price}${i.currency}`,
			image_url: `http:${i.image_url}`,
		})),
		buttons: [
			{
				type: 'postback',
				title: 'View more',
				payload: JSON.stringify({
					type: `VIEW_MORE`,
					query,
					offset: ++offset,
					limit,
				}),
			},
		],
	};
};
