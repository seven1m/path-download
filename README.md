# Path Download

This is a very loose collection of stuff to assist in downloading your entire feed of "moments" (status updates, pictures, videos, etc.) from the Path app (iOS and Android).

## What You'll Need

1. [Android Studio](https://developer.android.com/studio/)
2. Charles SSL Proxy or another SSL proxy
3. Ruby
4. Patience

## Steps

1. Download the Path APK from the Internet. Should be easy to find.

1. Launch the Android Studio. Choose to debug an APK and choose the Path APK you downloaded.

1. Open the AVD manager and create a new virtual device. It shouldn't matter which hardware you choose.

1. Launch the AVD in the emulator.

1. Drag your Path APK file onto the emulator window to install Path.

1. Set your wifi network to use Charles proxy. This is done in the emulator in the settings screen. I had to use my real host IP address because "localhost" didn't work.

1. Install the Charles SSL certificate in the emulator. This was many steps, sorry. The Charles website has some help for doing it.

1. In Charles, Choose Proxy menu, SSL Proxying Settings, and add `api.path.com:443` to the locations box.

1. Launch Path and sign in.

1. Watch the requests in Charles and copy the `oauth_token` from one of the requests.

1. Run bundler in this directory:

   ```
   gem install bundler
   bundle install
   ```

1. Download the feed using the ruby script in this repo and the token you copied.

   ```
   OAUTH_TOKEN=abc123 ruby download_feed.rb
   ```

1. Download the assets:

   ```
   ruby download_assets.rb
   ```

1. Start a local ruby web server.

   ```
   ruby -rwebrick -e "s=WEBrick::HTTPServer.new(:Port => 3000, :DocumentRoot => Dir.pwd); trap(%q(INT)){ s.shutdown }; s.start"
   ```

1. Load http://localhost:3000 in your browser.

That's it. Now you have a local copy of everything. The HTML page provided is only meant for making sure all the data
is present. The raw data is available in `feed.json` and you can use the data however you wish!

## License

See LICENSE in this directory.
