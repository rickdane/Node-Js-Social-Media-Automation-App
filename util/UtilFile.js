var fs = require('fs')
var sys = require('sys')


UtilFile = {

    readFile:function (filePath, callback) {

        var rows = new Array()

        var stream = fs.createReadStream(filePath)
        var iteration = 0, header = [], buffer = ""
        stream.addListener('data', function (data) {
            buffer += data.toString()
            var parts = buffer.split('\n')
            parts.forEach(function (d, i) {
                if (i == parts.length - 1) return
                rows[i] = d
            })
            callback(rows)
            buffer = parts[parts.length - 1]
        })

    },
    readPropertiesToMap:function (filePath, rows, callback) {

        var stream = fs.createReadStream(filePath)
        var iteration = 0, header = [], buffer = ""
        stream.addListener('data', function (data) {
            buffer += data.toString()
            var parts = buffer.split('\n')
            parts.forEach(function (d, i) {
                var pieces = d.split("=")
                rows[pieces[0]] = pieces[1]

            })
            buffer = parts[parts.length - 1]
            callback()
        })


    }, writeRowsToFile:function (outputPath, rows) {
        var outputStr = ""
        for (var i in rows) {
            outputStr += rows[i] + "\n"
        }

        fs.writeFile(outputPath, outputStr, function (err) {
            if (err) {
                return console.log(err);
            }
        });

    }

}