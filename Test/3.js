 /**
  * @description:2019.08.14 
  * @param {mylushu} 路书实体，一个路书实体对象代表一辆车
  * @param {position} 车辆信息，包括坐标信息
  * @param {carNo} 车牌号，表示地图显示主体车辆
  * @return: void
  * @author: DJDU
  */
    // 设置一个路书实体，一个路书实体在地图上相当于一辆小车，首次新建实体，下次传入实体，便于连续移动，不必移除实体
    function makeLuShu(carlushu,position,carMaster){
        var driving = new BMap.DrivingRoute(map);     //路书驾车实例
        // 具有起始坐标和目标坐标
        if(position.startpot.lat!=null&&position.endPot.lat!=null){
            // 用于判断车辆是否离线
            if(position.oldendPot.lat != position.endPot.lat){ 
                var p1=new BMap.Point(position.startpot.lng, position.startpot.lat); // 起始坐标
                var p2=new BMap.Point(position.endPot.lng, position.endPot.lat); // 目标坐标
                var distance=map.getDistance(p1,p2); //两点之间的距离，返回两点之间的距离，单位是米
                if(distance>10&&!carlushu.getMoving()){// carlushu是传入的之前保存的路书实体，用于车辆在地图上持续顺滑移动
                                                               // getMoving 自定义方法，判断车辆是否正在移动
                    driving.search(p1, p2); // 检索起点与终点的通过路径
                    driving.setSearchCompleteCallback(function (results) {// 设置检索结束后的回调函数
                        //如果驾车距离过大，大于1500米，证明gps定位偏离，则不执行移动
                        if(results.getPlan(0).getDistance(false)<1500){
                            var arrPois = [], 
                            plan = driving.getResults().getPlan(0);// 返回最近一次检索的结果

                            for (var j = 0; j < plan.getNumRoutes(); j++) {
                                var route = plan.getRoute(j);
                                arrPois = arrPois.concat(route.getPath());
                            }
                            carlushu.goPath(arrPois); // 设置小车持续移动的坐标点，形成平滑的路径
                            // makeMoreCarMessageHtml(position,carlushu.mylushu);// 添加自定义展示窗口信息，由于异步，只能通过函数调用
                        }
                    });
                }
            }
            // 车辆已离线，且只会触发一次
            else{
                if(position.isonline){
                    alert(position.carNo+"已离线");
                    // 关键代码，模拟车辆从离线变为在线
                    carlushu._marker.setIcon(new BMap.Icon("http://122.51.227.164:9000/myphone/mms.png", new BMap.Size(37, 50),{anchor : new BMap.Size(18, 25)}));
                    carlushu._marer.setRotation(carlushu._marker.getRotation());
                    position.isonline = false;
                }
            }
            return null;
        }

        // 只有起始坐标(只有首次点击车辆才会执行)
        else if(position.startpot.lat!=null&&position.endPot.lat==null){
            var p=new BMap.Point(position.startpot.lng, position.startpot.lat);
            var arrPois = [];
            var photo = "http://122.51.227.164:9000/myphone/mms.png";
            arrPois = arrPois.concat(p); // 用于连接两个或多个数组，该方法不会改变现有的数组，而仅仅会返回被连接数组的一个副本。
            if(carMaster){ // 选择多车时的主视野车
                map.setViewport(arrPois);//根据提供的地理区域或坐标设置地图视野，调整后的视野会保证包含提供的地理区域或坐标
            }
            if(position.isonline){
                photo = 'http://122.51.227.164:9000/myphone/mms.png';
            }
            var newlushu = new BMapLib.LuShu(map, arrPois, { // 创建路数实体
                    defaultContent: position.carNo,//展示车牌号
                    moreCarMessage:"",// 自定义展示窗口，用于展示车辆详细信息
                    autoView: false,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                    icon:  new BMap.Icon(photo, new BMap.Size(37, 50), { anchor: new BMap.Size(18, 25) }),
                    speed: 10,// 车辆移动速度
                    enableRotation: true,//是否设置marker随着道路的走向进行旋转
                });
            // makeMoreCarMessageHtml(position,newlushu);// 添加自定义展示窗口信息，由于异步，只能通过函数调用
            newlushu.start();// 路数实体开始移动


            //添加路书点击事件
            map.addEventListener('click',startlushu);
            function startlushu(e){
                if (!!e.overlay) {// 地图上的覆盖物
                    var markerId = newlushu._marker.ba;// 路数实体的在地图上的唯一标识
                    if (e.overlay.ba == markerId) {
                        newlushu._overlay._div2.style.visibility = "visible"; // 打开自定义详细信息窗口
                        newlushu._overlay._div.style.background = "#F40";
                        newlushu._overlay._div.style.color = "#FFF";
                    }
                } 
            }
            return newlushu;
        }
    }
