require 'json'
require 'fileutils'

def download(url)
  return if ARGV.first.to_s =~ /dry/
  path = url.sub(%r{\Ahttps?://}, '')
  FileUtils.mkdir_p(File.split(path).first)
  if File.exist?(path)
    puts "#{path} already exists"
  else
    puts `curl -o #{path} #{url}`
    puts "#{path} written"
  end
end

def fetch_photo(photo, video = nil)
  square = if photo['square']
             photo['url'] + '/' + photo['square']['file']
           elsif photo['ios'] && photo['ios']['2x']
             photo['url'] + '/' + photo['ios']['2x']['file']
           else
             raise 'cannot find a photo to download'
           end
  original = if video
               video['download_url'] + '/' + video['original']['file']
             else
               photo['url'] + '/' + photo['original']['file']
             end
  raise original if original !~ /\.(mov|mp4|jpg|jpeg)\z/
  download(square)
  download(original)
end

feed = JSON.parse(File.read('feed.json'))

feed['users'].each do |uid, user|
  if (photo = user['photo'])
    fetch_photo(photo)
  end
end

feed['moments'].each_with_index do |moment, index|
  puts
  puts '%.1f%% complete' % (index.to_f / feed['moments'].size * 100)
  puts
  if (photo = moment['photo'])
    if photo['photos']
      photo['photos'].each { |p| fetch_photo(p) }
    elsif photo['photo']
      fetch_photo(photo['photo'])
    end
  elsif (video = moment['video'])
    if video['photo']
      fetch_photo(video['photo'], video['video'])
    end
  end
end

puts 'done'
