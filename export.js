const buttons = require('./helpers/buttons');
const pkg = require('./package.json');

const getPackageInfo = () => ({
	name: pkg.name,
	version: pkg.version,
	description: pkg.description,
	author: pkg.author,
	main: pkg.main,
});

module.exports = {
	...buttons,
	pkg,
	getPackageInfo,
};
