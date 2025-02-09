all: clean buildweb buildgo 

buildweb:
	cd web && npm ci && npm run build 

buildgo:
	go build -o nvim-dadbod-bg .

testgo:
	go test -v ./...

manifest:
	./nvim-dadbod-bg -manifest nvim_dadbod_bg

rundboutdriver:
	go run ./dbout/cmd/main.go

clean:
	rm -f nvim-dadbod-bg nvim-dadbod-bg.log && rm -rf web/dist
