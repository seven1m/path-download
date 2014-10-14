var url = 'feed.json';

load(url);

function get_user_photo(user) {
  if(user && user.photo && user.photo.url && user.photo.ios && user.photo.ios['1x']) {
    return '<img class="user-photo" src="' + user.photo.url + '/' + user.photo.ios['1x'].file + '">';
  } else {
    return '';
  }
}

function append_comments(item, item_html) {
  var j;
  var all = [];
  if(item.comments) {
    for(j=0; j<item.comments.length; j++) {
      var comment = item.comments[j];
      var time = moment(new Date(comment.created * 1000));
      var user = users[comment.user_id];
      var user_photo = get_user_photo(user);
      var comment_html = $(
        '<div class="comment">' +
          '<div class="comment-time">' + time.format('MM/DD/YYYY hh:mm a') + '</div>' +
          '<div class="user">' + user_photo + ' ' + user.first_name + ' ' + user.last_name + '</div>' +
          '<div class="body">' + comment.body + '</div>' +
        '</div>'
      );
      all.push([comment.created, comment_html])
    }
  }
  if(item.emotions && item.emotions.users) {
    for(j=0; j<item.emotions.users.length; j++) {
      var emotion = item.emotions.users[j];
      var time = moment(new Date(emotion.created * 1000));
      var user = users[emotion.user_id];
      var user_photo = get_user_photo(user);
      var comment_html = $(
        '<div class="comment">' +
          '<div class="comment-time">' + time.format('MM/DD/YYYY hh:mm a') + '</div>' +
          '<div class="user">' +
            user_photo + ' ' + user.first_name + ' ' + user.last_name +
            ' <img src="img/' + emotion.emotion_type + '.png" class="emoji">' +
          '</div>' +
        '</div>'
      );
      all.push([emotion.created, comment_html])
    }
  }
  all.sort();
  for(j=0; j<all.length; j++) {
    item_html.find('.comments').append(all[j][1]);
  }
}

function load(url) {
  $.getJSON(url, function(feed) {
    window.feed = feed;
    window.users = feed.users;
    var i;
    var main = $('main');
    for(i=0; i<feed.moments.length; i++) {
      var item = feed.moments[i];
      var time = moment(new Date(item.created * 1000));
      //console.log(item);
      var photo;
      if(photo = (item.photo && item.photo.photo) || (item.video && item.video.photo)) {
        var src, full_url = '';
        if(photo.square) {
          src = photo.url + '/' + photo.square.file;
        } else if(photo.ios && photo.ios['2x']) {
          src = photo.url + '/' + photo.ios['2x'].file;
        }
        if(item.photo && item.photo && item.photo.photo.original) {
          full_url = item.photo.photo.url + '/' + item.photo.photo.original.file;
        } else if(item.video && item.video.video && item.video.video && item.video.video.original) {
          full_url = item.video.video.url + '/' + item.video.video.original.file;
        }
        var item_html = $(
          '<section class="clearfix">' +
            '<div class="time">' +
              time.format('MM/DD/YYYY hh:mm a') +
            '</div>' +
            '<div class="item">' +
              '<a href="' + full_url + '">' +
                '<img src="' + src + '" class="img-responsive">' +
              '</a>' +
              (item.headline ? ('<br>' + item.headline) : '') +
              '<div class="comments"></div>' +
            '</div>' +
          '</section>'
        );
      } else {
        var item_html = $(
          '<section class="clearfix">' +
            '<div class="time">' +
              time.format('MM/DD/YYYY hh:mm a') +
            '</div>' +
            '<div class="item">' +
              item.headline +
              '<div class="comments"></div>' +
            '</div>' +
          '</section>'
        );
      }
      append_comments(item, item_html);
      main.append(item_html);
      item_html.attr('data-json', JSON.stringify(item));
    }
  });
}
