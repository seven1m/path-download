var url = 'feed.json';

load(url);

function local_src(url) {
  return url.replace(/^https?:\/\//, '');
}

function get_user_photo(user) {
  if(user && user.photo && user.photo.url && user.photo.ios && user.photo.ios['2x']) {
    return '<img class="user-photo" src="' + local_src(user.photo.url) + '/' + user.photo.ios['2x'].file + '">';
  } else {
    return '';
  }
}

function photo_src(photo) {
  var base = local_src(photo.url);
  if (photo.square) {
    return base + '/' + photo.square.file;
  } else if(photo.ios && photo.ios['2x']) {
    return base + '/' + photo.ios['2x'].file;
  }
}

function append_comments(item, item_html) {
  var j;
  var all = [];
  if(item.comments) {
    for(j=0; j<item.comments.length; j++) {
      var comment = item.comments[j];
      var time = moment(new Date(comment.created * 1000));
      var user = users[comment.user_id] || {};
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
      if (emotion.emotion_type === 'comment') continue;
      var time = moment(new Date(emotion.created * 1000));
      var user = users[emotion.user_id] || {};
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
    window.friends = Object.values(feed.users).filter(function(u) { return u.is_friend });
    var i;
    var main = $('main');
    for(i=0; i<feed.moments.length; i++) {
      var item = feed.moments[i];
      var time = moment(new Date(item.created * 1000));
      var photos = null;
      var photos_html;
      if (item.photo && item.photo.photos) {
        photos = item.photo.photos;
      } else if (item.photo && item.photo.photo) {
        photos = [item.photo.photo];
      }
      if (photos) {
        photos_html = photos.map(function(photo) {
          return '<a href="' + local_src(photo.url) + '/' + photo.original.file + '">' + '<img src="' + photo_src(photo) + '" class="img-responsive">' + '</a>'
        }).join('<br>')
      } else if (item.video && item.video.photo) {
        photos_html = '<a href="' + local_src(item.video.video.download_url) + '/' + item.video.video.original.file + '">' + '<img src="' + photo_src(item.video.photo) + '" class="img-responsive">' + '</a>'
      } else {
        photos_html = ''
      }
      var user = users[item.user_id] || {};
      var user_photo = get_user_photo(user);
      var item_html = $(
        '<section class="clearfix">' +
          '<div class="time">' +
            user_photo + ' ' + user.first_name + ' ' + user.last_name + '<br>' +
            time.format('MM/DD/YYYY<br>hh:mm a') +
          '</div>' +
          '<div class="item">' +
            photos_html +
            (item.text ? item.text.body : '') +
            (item.headline ? ('<br>' + item.headline) : '') +
            '<div class="comments"></div>' +
          '</div>' +
        '</section>'
      );
      append_comments(item, item_html);
      main.append(item_html);
      item_html.attr('data-json', JSON.stringify(item));
    }
  });
}
