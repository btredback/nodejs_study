/**
 * Created by bt on 2016/1/15.
 */
var photos = [];
photos.push({
    name:'baidu LOGO',
    path:'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/logo_white_fe6da1ec.png'
});
//response.render('page/pack Name',obj)
exports.showList = function(req,res){
    res.render(
        'photos',
        {
            title:'Photos',
            photos:photos
        }
    )
}