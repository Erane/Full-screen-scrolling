/**
 * Created by Administrator on 2015/8/22.
 */

var get={ //兼容IE获取class
    byId:function(id){
        return document.getElementById(id)
    },
    byClass:function(aClass,parent){
        if(document.getElementsByClassName){
            return document.getElementsByClassName(aClass)
        }
        var aParent=parent?get.byId(parent):document,
            Aclass=[],
            elems=aParent.getElementsByTagName("*");

        for(var i= 0,l=elems;i< l.length;i++){
            if(l[i].className == aClass){
                Aclass.push(l[i])
            }
        }
        return Aclass
    },
    byTagName:function(tag,parent){
        return (parent || document).getElementsByTagName(tag)
    }
};

var method={ //常用事件或功能封装
    addEvent:function(obj,type,fn){
        if(document.addEventListener){
            obj.addEventListener(type,fn,false)
        }else if(document.attachEvent){
            obj.attachEvent("on"+type,fn)
        }
        obj["on"+type]=fn;
    },
    removeEvent:function(obj,type,fn){
        if(document.removeEventListener){
            obj.removeEventListener(type,fn)
        }else if(document.detachEvent){
            obj.detachEvent("on"+type,fn)
        }
        obj["on"+type]=null;
    }
};

window.onload=function(){
    var body=get.byTagName("body")[0];
    var wrap=get.byId("wrap")  ;
    var page=get.byClass("page");
    var h=null;//用于存放当前窗口高度
    var menu=get.byClass("menu")[0];
    var nodes=[];//用于存放自动生成的li标签
    var nextIndex=0;//表示鼠标 点击 or 滑动 要到达的索引值
    var nowTop=0;//当前wrap的top值
    var nextTop=0;//wrap即将滚动的top值
    var playing=true;//用于判断page是否正在滚动动画
    var timer=null;//动画周期
    var speed=null;//动画速度

    //生成li标签
    for(var i=0;i<page.length;i++){
        nodes[i]=document.createElement("li");
        nodes[i].index=i;
        menu.appendChild(nodes[i]);
        nodes[i].onclick=function(){
            win.storeTop();//储存当前top值
            nextIndex=this.index;//获取被点击标签的索引值 注意在调用storeTop()之后
            win.animate();//开始滚动
        }
    }
    //为第一个li添加样式
    if(page.length>0){
        nodes[0].className=nodes[0].className==""?"active":nodes[0].className+" active";
        //下面这个也是添加calssName的功能,不能很好兼容IE就不用了
        //nodes[0].classList.add("active")
    }
    var win={
        changeBodyHeight:function(){//设置body高度等于浏览器的可见高度
            h=document.documentElement.clientHeight || document.body.clientHeight;
            body.style.height=h+"px";
        },
        changePageHeight:function(){//设置每一个page的高度保持与body一样
            for(var i=0;i<page.length;i++){
                page[i].style.height=h+"px";
            }
        },
        storeTop:function(){//储存滑动前的top值
            nowTop=nextIndex*h;
        },
        animate:function(){
            if(!playing){//如果正在切换page,不往下操作
                return false
            }
            nextTop=nextIndex*h;//获取目标的top值
            if(nextTop == nowTop){ //如果点击同一个li,不往下操作
                return false
            }
            playing=false;//将运动状态变更为false
            timer=setInterval(function(){
                if(nextTop > nowTop){//看这里 只要记住初始top值为0,向下滑动就是把top变负值就能理解了
                    speed -=30;
                    (speed < -nextTop)&&(speed = -nextTop)//如果speed的值超出目标值,将它纠正为目标值
                }else{
                    speed +=30;
                    (speed > -nextTop)&&(speed = -nextTop)
                }
                wrap.style.top=speed+"px";
                if(speed == -nextTop){//如果speed等于目标值值 退出定时器
                    clearInterval(timer);
                    playing=true;//恢复play的值
                    for(var i=0;i<nodes.length;i++){//清空li的样式
                        nodes[i].className=nodes[i].className==""?"":nodes[i].className.replace(/active|\sactive|active\s|\sactive\s/i,"")
                    }
                    nodes[nextIndex].className="active"//为目标li添加样式
                }
            },10)
        },
        ScrollEvent:function(e){
            if(e.addEventListener){
                method.addEvent(e,"DOMMouseScroll",win.scrollFnc)//这是火狐的鼠标滑动事件
            }
            e.onmousewheel=win.scrollFnc;//这是其他浏览器的滑动事件
        },
        scrollFnc:function(e){
            if(!playing){
                return false
            }
            var e=e||window.event;
            var t=null;
            win.storeTop();
            if(e.wheelDelta){//IE,谷歌等
                t= e.wheelDelta;
                //向上滚 t为正值,索引值-1
                //向下滚 t为负值,索引值+1
                t>0?nextIndex--:nextIndex++;
            }else if(e.detail){//火狐
                t= e.detail;
                //与其他浏览器相反
                //向上滚 t为负值,索引值-1
                //向下滚 t为正值,索引值+1
                t<0?nextIndex--:nextIndex++;
            }
            win.changeIndex();//防止滑出页面
            win.animate();
            //阻止默认事件
            e.preventDefault();
        },
        changeIndex:function(){
            nextIndex=nextIndex>=page.length?page.length-1:nextIndex;//滑动到最后一屏,锁定在最后一屏不再向下滑动
            nextIndex=nextIndex<0?0:nextIndex;//滑动到第一屏,锁定在第一屏不再向上滑动
        }
    };
    win.changeBodyHeight();
    win.changePageHeight();
    win.ScrollEvent(document);
    window.onresize=function(){//浏览器窗口尺寸发生变化时自动修正页面的尺寸
        setTimeout(function(){
            win.changeBodyHeight();
            win.changePageHeight();
            wrap.style.top= -(nextIndex*h)+"px"
        },500);
    }
};