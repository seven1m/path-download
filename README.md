# Path Download

This is a very loose collection of stuff to assist in downloading your entire feed of "moments" (status updates, pictures, videos, etc.) from the Path app (iOS and Android).

## What You'll Need

1. [Android Studio](https://developer.android.com/studio/)
2. Charles SSL Proxy
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

1. Launch Path and sign in.

1. Watch the requests in Charles and copy the `oauth_token` from one of the requests.

1. Download the feed using the ruby script in this repo.

   ```
   OAUTH_TOKEN=abc123 ruby download.rb
   ```

1. Start a local ruby web server.

   ```
   ruby -rwebrick -e "s=WEBrick::HTTPServer.new(:Port => 3000, :DocumentRoot => Dir.pwd); trap(%q(INT)){ s.shutdown }; s.start"
   ```

1. Load http://localhost:3000 in your browser.

1. Save the entire page (complete webpage, including assets) using the File -> Save menu item. Save the filename as "cached.html" in the same directory.

1. Load http://localhost:3000/cached.html in your browser to ensure it looks ok. Also check inside the `cached_files` directory to ensure there are images there.

1. Download everything using wget.

   ```
   mkdir all
   cd all
   wget --mirror -H -k -K --limit-rate=100K -U "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0" http://localhost:3000/cached.html
   ```

That's it. Now you have a static, local copy of everything.

## License

See LICENSE in this directory.
