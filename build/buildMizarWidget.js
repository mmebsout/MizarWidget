({
	baseUrl: "../src",
	include : ["../build/almond","MizarWidget"],
	out: "../MizarWidget.min.js",
	optimize: "none",
    mainConfigFile: "../src/main.js",
    preserveLicenseComments: false,
	wrap: {
        startFile: './start.frag',
        endFile: './end.frag'
    }
})
