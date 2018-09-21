require 'json'
require 'time'

url = "https://api.path.com/6/moment/feed/home?emotions_with_comments=true&connection_type=WIFI&oauth_token=#{ENV['OAUTH_TOKEN']}&limit=20"

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
        elsif key == 'ad_enabled'
          # noop
        else
          puts '-' * 100
          puts 'unknown values type'
          p key
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
