# 1. run Path in the Android Emulator, proxying thru Charles SSL Proxy
#    emulator -avd MyAVD -http-proxy http://localhost:8888
#    (you'll need to install the charles SSL certificate in Android so that SSL requests are proxied and recorded)
# 2. obtain the oauth token and user id from one of the requests
# 3. USER_ID=abc123 OAUTH_TOKEN=xyz987 ruby download.rb
# 4. ruby -rwebrick -e "s=WEBrick::HTTPServer.new(:Port => 3000, :DocumentRoot => Dir.pwd); trap(%q(INT)){ s.shutdown }; s.start"
# 5. load http://localhost:3000 in your browser
# 6. save the entire page (complete webpage, including assets) using the File -> Save menu item. Save the filename as "cached.html" in the same directory.
# 7. load http://localhost:3000/cached.html in your browser to ensure it looks ok
# 8. mkdir all && cd all
# 9. wget --mirror -H -k -K --limit-rate=50K -U "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0" http://localhost:3000/cached.html

require 'json'
require 'time'
require 'pry'

url = "https://184.169.128.183/3/moment/feed?limit=20&user_id=#{ENV['USER_ID']}&gs=1&oauth_token=#{ENV['OAUTH_TOKEN']}'

def save_feed(feed)
  filename = 'feed.json'
  File.open(filename, 'w', encoding: 'utf-8') { |f| f.write(feed.to_json) }
  puts '-' * 100
  puts 'done!'
end

feed = {}
last_created = nil

while (result = `curl -k "#{url}"`)
  puts url
  puts result.length
  p result[0..100] + '...'
  if result =~ /^\{/
    result = JSON.parse(result) rescue nil
    if result and result['moments'] and result['moments'].length > 0
      p Time.at(result['moments'].last['created'])
      created = result['moments'].last['created']
      if created == last_created
        save_feed(feed)
        exit
      end
      last_created = created
      result.each do |key, values|
        if values.is_a?(Array)
          feed[key] ||= []
          feed[key] += values
        elsif values.is_a?(Hash)
          feed[key] ||= {}
          feed[key].merge! values
        else
          puts '-' * 100
          puts 'unknown values type'
          p values
        end
      end
    else
      save_feed(feed)
      exit
    end
  else
    save_feed(feed)
    exit
  end
  if url =~ /older_than/
    url.sub!(/older_than=.*$/, "older_than=#{created}")
  else
    url += "&older_than=#{created}"
  end
  sleep(rand * 2)
end

save_feed(feed)
