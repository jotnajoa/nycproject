createHierarchy(treedata) {
    var sortingTarget;

    function unPackProxy(data, index) {
        var predata = {...data[index] };
        console.log(predata)
        var children = [...predata.children];
        console.log(children)
        var prearr = [];
        var preprearr = [];
        children.forEach((d, i) => {
            preprearr[i] = {...d }
        })
        console.log(preprearr)
        preprearr.forEach((d) => {
            var childrenarr = [...d.children];
            var arr = [];
            childrenarr.forEach((t) => {
                arr.push({...t })
            });
            // console.log(arr);
            d.children = arr;
        })
        console.log(preprearr)
        return preprearr
    }
    var finalArr = [{
        name: 'TypeRaioData',
        children: [{
                county: 'Brooklyn',
                children: []
            },
            {
                county: 'Queens',
                children: []
            },
            {
                county: 'Manhattan',
                children: []
            },
            {
                county: 'Bronx',
                children: []
            }
        ]
    }]
    finalArr[0].children
    unPackProxy(treedata, 0)


    console.log('original form is', treedata)


    var data = treedata;

    var result = d3.hierarchy(data, (d) => d.children)
        .sum((t) => {
            if (this.treeSelectedCategory == 'cost') {
                sortingTarget = 'costSum'
                    // console.log(t[0])
                return t[sortingTarget]
            } else {
                sortingTarget = 'countSum'
                return t[sortingTarget]
            }
        }).sort((node1, node2) => {
            return d3.ascending(node1[sortingTarget], node2[sortingTarget])
        })

    this.hierarchyData = result

    var treemap = d3.treemap().size([this.width - this.margin.horizontal * 2, this.height - this.margin.vertical * 2])
    treemap(this.hierarchyData);
    console.log(this.hierarchyData)
},