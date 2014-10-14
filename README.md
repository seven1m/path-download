# Path Download

This is a very loose collection of stuff to assist in downloading your entire feed of "moments" (status updates, pictures, videos, etc.) from the Path app (iOS and Android).

## What You'll Need

1. Android Emulator, which you can get from Google via the SDK
2. SSL Proxy (I used Charles Proxy on Mac OSX)
3. Ruby
4. Patience

## Steps

1. Run Path in the Android Emulator, proxying thru Charles SSL Proxy

   ```
   emulator -avd MyAVD -http-proxy http://localhost:8888
   ```

   (You'll need to install the charles SSL certificate in Android so that SSL requests are proxied and recorded.)

2. Obtain the oauth token and user id from one of the requests.

3. Download the feed.

   ```
   USER_ID=abc123 OAUTH_TOKEN=xyz987 ruby download.rb
   ```

4. Start a local ruby web server.

   ```
   ruby -rwebrick -e "s=WEBrick::HTTPServer.new(:Port => 3000, :DocumentRoot => Dir.pwd); trap(%q(INT)){ s.shutdown }; s.start"
   ```

5. Load http://localhost:3000 in your browser.

6. Save the entire page (complete webpage, including assets) using the File -> Save menu item. Save the filename as "cached.html" in the same directory.

7. Load http://localhost:3000/cached.html in your browser to ensure it looks ok. Also check inside the "cached_files" directory to ensure there are images there.

8. Download everything using wget.

   ```
   mkdir all
   cd all
   wget --mirror -H -k -K --limit-rate=100K -U "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0" http://localhost:3000/cached.html
   ```

## License

See LICENSE in this directory.