const fs = require('fs')
const { BSON, EJSON } = require('bson')
function main() {
  const content = fs.readFileSync('/tmp/11.fix')
  const d = BSON.serialize(content)
  console.log(d)
}
main()

