const cookieHTML = `
<aside id="cookie-policy-wrapper" class="theme-inverted">
  <div class="cookie-policy-content bg">
    <p>Our websites may use cookies to personalize and enhance your experience. By continuing without changing your cookie settings, you agree to this collection. For more information, please see our <a href="https://privacy.uconn.edu/privacy-notices/website" target="_blank">University Websites Privacy Notice</a>.</p>
    <button aria-label="Accept cookies" class="btn-accept-cookies theme-base bg">OK</button>
  </div>
</aside>
`;

class Cookies {
  constructor() {
    !this.checkCookie() ||
      (null !== this.getCookie("uconn-cookie-consent") &&
        "true" === this.getCookie("uconn-cookie-consent")) ||
      this.createConsentDiv();
  }

  createConsentDiv() {
    var o = document.getElementsByTagName("body")[0];
    var e = document.createElement("div");
    e.setAttribute("id", "cookie-notice"),
      (e.innerHTML = cookieHTML),
      o.insertBefore(e, o.firstChild);

    e.querySelector(".btn-accept-cookies")?.addEventListener("click", e => {
      e.preventDefault();
      this.acknowledgeCookies();
    });
  }

  acknowledgeCookies() {
    this.setCookie("uconn-cookie-consent", "true", 365);
    document.getElementById("cookie-policy-wrapper")?.classList.add("accepted");
  }

  setCookie(t: string, o: string, i: number) {
    var e = "";
    if (i) {
      var n = new Date();
      n.setTime(n.getTime() + 24 * i * 60 * 60 * 1e3),
        (e = "; expires=" + n.toUTCString());
    }
    var a = t + "=" + (o || "") + e + ";path=/",
      r = window.location.hostname;
    -1 !== r.indexOf("uconn.edu", r.length - 9) && (a += ";domain=.uconn.edu"),
      (document.cookie = a);
  }

  getCookie(t: string) {
    for (
      var o = t + "=", i = document.cookie.split(";"), e = 0;
      e < i.length;
      e++
    ) {
      for (var n = i[e]; " " == n.charAt(0); ) n = n.substring(1, n.length);
      if (0 == n.indexOf(o)) return n.substring(o.length, n.length);
    }
    return null;
  }

  checkCookie() {
    if (navigator.cookieEnabled) return !0;
    document.cookie = "cookietest=1";
    var t = -1 != document.cookie.indexOf("cookietest=");
    return (
      (document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT"),
      t
    );
  }
}

export default Cookies;
