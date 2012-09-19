function Set() {

    var i = curIndx = 0

    var dataArr = Array();

    var get = function (indx) {
        return dataArr[indx]
    }

    var add = function (obj) {
        var existIndx = checkIfContains(dataArr, obj)
        if (existIndx < 0) {
            // change the positin of the object to last
            delete dataArr[existIndx]
        }
        dataArr[i] = obj
        i++
    }

    var each = function (callback) {
        var i = 0
        while (i <= dataArr.length - 1) {
            if (dataArr[i] != undefined && dataArr[i] != null) {
                callback(dataArr[i])
            }
        }
    }


}

function checkIfContains(dataArr, obj) {
    var i = 0
    while (i <= dataArr.length - 1) {
        if (dataArr[i] == obj) {
            return i
        }
    }
    return -1
}