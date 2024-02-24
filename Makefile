all:
	go build -o nvim-dadbod-ext .

manifest:
	./nvim-dadbod-ext -manifest nvim_dadbod_ext

clean:
	rm -f nvim-dadbod-ext nvim-dadbod-ext.log
