INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-007 - Apache Tomcat TOCTOU Race Condition Vulnerabilidad (CVE-2024-50379)',
  '# SA-2025-007 - Apache Tomcat TOCTOU Race Condition Vulnerabilidad (CVE-2024-50379)

## Resumen de la Vulnerabilidad

Time-of-check Time-of-use (TOCTOU) Race Condition vulnerability during JSP compilation in Apache Tomcat permits an RCE on case insensitive file systems when the default servlet is enabled for write (non-default configuration). Products not listed in the Impact Details section have not been evaluated.

### Información de la Vulnerabilidad

- **CVE ID:** CVE-2024-50379
- **Security Advisory:** SA-2025-007
- **Fecha de Publicación:** 7/8/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000122669).*',
  'Time-of-check Time-of-use (TOCTOU) Race Condition vulnerability during JSP compilation in Apache Tomcat permits an RCE on case insensitive file systems when the default servlet is enabled for write (n...',
  'sa-2025-007-apache-tomcat-toctou-race-condition-vulnerability-cve-2024-50379-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-08-07T19:28:19.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-007 - Apache Tomcat TOCTOU Race Condition Vulnerability (CVE-2024-50379)',
  'Time-of-check Time-of-use (TOCTOU) Race Condition vulnerability during JSP compilation in Apache Tomcat permits an RCE on case insensitive file systems when the',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-007-apache-tomcat-toctou-race-condition-vulnerability-cve-2024-50379-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2023-059 - DHEat attack (CVE-2002-20001)',
  '# SA-2023-059 - DHEat attack (CVE-2002-20001)

## Resumen de la Vulnerabilidad

The Diffie-Hellman Key Agreement Protocol enables remote attackers to send arbitrary numbers without public keys, triggering costly server-side DHE modular-exponentiation calculations. This attack requires minimal CPU resources and bandwidth, and may be more disruptive in cases where clients require...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2002-20001
- **Security Advisory:** SA-2023-059
- **Fecha de Publicación:** 29/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000112244).*',
  'The Diffie-Hellman Key Agreement Protocol enables remote attackers to send arbitrary numbers without public keys, triggering costly server-side DHE modular-exponentiation calculations. This attack req...',
  'sa-2023-059-dheat-attack-cve-2002-20001-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-29T16:44:08.000Z',
  'published',
  'Equipo CECOM',
  'SA-2023-059 - DHEat attack (CVE-2002-20001)',
  'The Diffie-Hellman Key Agreement Protocol enables remote attackers to send arbitrary numbers without public keys, triggering costly server-side DHE modular-expo',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2023-059-dheat-attack-cve-2002-20001-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-065 - Diffie-Hellman Resource Exhaustion (CVE-2024-41996)',
  '# SA-2025-065 - Diffie-Hellman Resource Exhaustion (CVE-2024-41996)

## Resumen de la Vulnerabilidad

Validating the order of the public keys in the Diffie-Hellman Key Agreement Protocol, when an approved safe prime is used, allows remote attackers (from the client side) to trigger unnecessarily expensive server-side DHE modular-exponentiation calculations. The client may cause asymmetric resource c...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2024-41996
- **Security Advisory:** SA-2025-065
- **Fecha de Publicación:** 29/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000128178).*',
  'Validating the order of the public keys in the Diffie-Hellman Key Agreement Protocol, when an approved safe prime is used, allows remote attackers (from the client side) to trigger unnecessarily expen...',
  'sa-2025-065-diffie-hellman-resource-exhaustion-cve-2024-41996-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-29T16:40:30.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-065 - Diffie-Hellman Resource Exhaustion (CVE-2024-41996)',
  'Validating the order of the public keys in the Diffie-Hellman Key Agreement Protocol, when an approved safe prime is used, allows remote attackers (from the cli',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-065-diffie-hellman-resource-exhaustion-cve-2024-41996-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2023-088 - Diffie-Hellman Key allows long exponents (CVE-2022-40735)',
  '# SA-2023-088 - Diffie-Hellman Key allows long exponents (CVE-2022-40735)

## Resumen de la Vulnerabilidad

Long exponents are permitted under the Diffie-Hellman Key Agreement Protocol, making some calculations needlessly expensive. When there are sufficient subgroup constraints, it is possible to utilize appropriately small exponents, which results in less expensive calculations. The particulars of the D...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2022-40735
- **Security Advisory:** SA-2023-088
- **Fecha de Publicación:** 29/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000113602).*',
  'Long exponents are permitted under the Diffie-Hellman Key Agreement Protocol, making some calculations needlessly expensive. When there are sufficient subgroup constraints, it is possible to utilize a...',
  'sa-2023-088-diffie-hellman-key-allows-long-exponents-cve-2022-40735-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-29T16:39:36.000Z',
  'published',
  'Equipo CECOM',
  'SA-2023-088 - Diffie-Hellman Key allows long exponents (CVE-2022-40735)',
  'Long exponents are permitted under the Diffie-Hellman Key Agreement Protocol, making some calculations needlessly expensive. When there are sufficient subgroup ',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2023-088-diffie-hellman-key-allows-long-exponents-cve-2022-40735-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2024-011 - libcurl HTTP authentication leak (CVE-2018-1000007)',
  '# SA-2024-011 - libcurl HTTP authentication leak (CVE-2018-1000007)

## Resumen de la Vulnerabilidad

It was found that curl and libcurl might send their Authentication header to a third party HTTP server upon receiving an HTTP REDIRECT reply. This could leak authentication token to external entities.Products not listed in the Impact Details section have not been evaluated.  Furthermore, products th...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2018-1000007
- **Security Advisory:** SA-2024-011
- **Fecha de Publicación:** 29/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000128177).*',
  'It was found that curl and libcurl might send their Authentication header to a third party HTTP server upon receiving an HTTP REDIRECT reply. This could leak authentication token to external entities....',
  'sa-2024-011-libcurl-http-authentication-leak-cve-2018-1000007-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-29T16:37:06.000Z',
  'published',
  'Equipo CECOM',
  'SA-2024-011 - libcurl HTTP authentication leak (CVE-2018-1000007)',
  'It was found that curl and libcurl might send their Authentication header to a third party HTTP server upon receiving an HTTP REDIRECT reply. This could leak au',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2024-011-libcurl-http-authentication-leak-cve-2018-1000007-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2024-010 - libcurl HTTP2 trailer out-of-bounds read (CVE-2018-1000005)',
  '# SA-2024-010 - libcurl HTTP2 trailer out-of-bounds read (CVE-2018-1000005)

## Resumen de la Vulnerabilidad

libcurl contains an outbounds read in code handling HTTP/2 trailers, potentially causing future trailers to be messed up due to a stored size being one byte less than required. This could lead to a crash or large data being passed to client write, potentially causing denial-of-service or information...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2018-1000005
- **Security Advisory:** SA-2024-010
- **Fecha de Publicación:** 29/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000128176).*',
  'libcurl contains an outbounds read in code handling HTTP/2 trailers, potentially causing future trailers to be messed up due to a stored size being one byte less than required. This could lead to a cr...',
  'sa-2024-010-libcurl-http2-trailer-out-of-bounds-read-cve-2018-1000005-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-29T16:34:34.000Z',
  'published',
  'Equipo CECOM',
  'SA-2024-010 - libcurl HTTP2 trailer out-of-bounds read (CVE-2018-1000005)',
  'libcurl contains an outbounds read in code handling HTTP/2 trailers, potentially causing future trailers to be messed up due to a stored size being one byte les',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2024-010-libcurl-http2-trailer-out-of-bounds-read-cve-2018-1000005-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-018 - FreeBSD Blacklistd Remote Code Execution (CVE-2024-7589)',
  '# SA-2025-018 - FreeBSD Blacklistd Remote Code Execution (CVE-2024-7589)

## Resumen de la Vulnerabilidad

A signal handler in sshd(8) may call a logging function that is not async-signal-safe. The signal handler is invoked when a client does not authenticate within the LoginGraceTime seconds (120 by default). This signal handler executes in the context of the sshd(8)&#39;s privileged code, which is not ...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2024-7589
- **Security Advisory:** SA-2025-018
- **Fecha de Publicación:** 21/2/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000123529).*',
  'A signal handler in sshd(8) may call a logging function that is not async-signal-safe. The signal handler is invoked when a client does not authenticate within the LoginGraceTime seconds (120 by defau...',
  'sa-2025-018-freebsd-blacklistd-remote-code-execution-cve-2024-7589-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-02-21T18:00:02.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-018 - FreeBSD Blacklistd Remote Code Execution (CVE-2024-7589)',
  'A signal handler in sshd(8) may call a logging function that is not async-signal-safe. The signal handler is invoked when a client does not authenticate within ',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-018-freebsd-blacklistd-remote-code-execution-cve-2024-7589-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-073 - ExtremeControl (NAC) ''onmouseover'' XSS (CVE-2025-6235)',
  '# SA-2025-073 - ExtremeControl (NAC) ''onmouseover'' XSS (CVE-2025-6235)

## Resumen de la Vulnerabilidad

In ExtremeControl before 25.5.12, a cross-site scripting (XSS) vulnerability was discovered in a login interface of the affected application. The issue stems from improper handling of user-supplied input within HTML attributes, allowing an attacker to inject script code that may execute in a user&#3...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2025-6235
- **Security Advisory:** SA-2025-073
- **Fecha de Publicación:** 21/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000128019).*',
  'In ExtremeControl before 25.5.12, a cross-site scripting (XSS) vulnerability was discovered in a login interface of the affected application. The issue stems from improper handling of user-supplied in...',
  'sa-2025-073-extremecontrol-nac-onmouseover-xss-cve-2025-6235-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-21T18:35:14.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-073 - ExtremeControl (NAC) ''onmouseover'' XSS (CVE-2025-6235)',
  'In ExtremeControl before 25.5.12, a cross-site scripting (XSS) vulnerability was discovered in a login interface of the affected application. The issue stems fr',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-073-extremecontrol-nac-onmouseover-xss-cve-2025-6235-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-066 - Linux PAM Privilege Escalation (CVE-2025-6020)',
  '# SA-2025-066 - Linux PAM Privilege Escalation (CVE-2025-6020)

## Resumen de la Vulnerabilidad

A flaw was found in linux-pam. The module pam_namespace may use access user-controlled paths without proper protection, allowing local users to elevate their privileges to root via multiple symlink attacks and race conditions.Products not listed in the Impact Details section have not been evaluated....

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2025-6020
- **Security Advisory:** SA-2025-066
- **Fecha de Publicación:** 18/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000127989).*',
  'A flaw was found in linux-pam. The module pam_namespace may use access user-controlled paths without proper protection, allowing local users to elevate their privileges to root via multiple symlink at...',
  'sa-2025-066-linux-pam-privilege-escalation-cve-2025-6020-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-18T18:21:20.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-066 - Linux PAM Privilege Escalation (CVE-2025-6020)',
  'A flaw was found in linux-pam. The module pam_namespace may use access user-controlled paths without proper protection, allowing local users to elevate their pr',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-066-linux-pam-privilege-escalation-cve-2025-6020-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-067 - libblockdev Local Privilege Escalation (CVE-2025-6019)',
  '# SA-2025-067 - libblockdev Local Privilege Escalation (CVE-2025-6019)

## Resumen de la Vulnerabilidad

A Local Privilege Escalation (LPE) vulnerability was found in libblockdev. Generally, the "allow_active" setting in Polkit permits a physically present user to take certain actions based on the session type. Due to the way libblockdev interacts with the udisks daemon, an "allow_active" user on a sys...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2025-6019
- **Security Advisory:** SA-2025-067
- **Fecha de Publicación:** 18/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000127988).*',
  'A Local Privilege Escalation (LPE) vulnerability was found in libblockdev. Generally, the "allow_active" setting in Polkit permits a physically present user to take certain actions based on the sessio...',
  'sa-2025-067-libblockdev-local-privilege-escalation-cve-2025-6019-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-18T18:16:45.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-067 - libblockdev Local Privilege Escalation (CVE-2025-6019)',
  'A Local Privilege Escalation (LPE) vulnerability was found in libblockdev. Generally, the "allow_active" setting in Polkit permits a physically present user to ',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-067-libblockdev-local-privilege-escalation-cve-2025-6019-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-064 - GNU C Untrusted Library (CVE-2025-4802)',
  '# SA-2025-064 - GNU C Untrusted Library (CVE-2025-4802)

## Resumen de la Vulnerabilidad

Untrusted LD_LIBRARY_PATH environment variable vulnerability in the GNU C Library version 2.27 to 2.38 allows attacker controlled loading of dynamically shared library in statically compiled setuid binaries that call dlopen (including internal dlopen calls after setlocale or calls to NSS functions s...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2025-4802
- **Security Advisory:** SA-2025-064
- **Fecha de Publicación:** 18/7/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000127987).*',
  'Untrusted LD_LIBRARY_PATH environment variable vulnerability in the GNU C Library version 2.27 to 2.38 allows attacker controlled loading of dynamically shared library in statically compiled setuid bi...',
  'sa-2025-064-gnu-c-untrusted-library-cve-2025-4802-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-07-18T18:16:04.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-064 - GNU C Untrusted Library (CVE-2025-4802)',
  'Untrusted LD_LIBRARY_PATH environment variable vulnerability in the GNU C Library version 2.27 to 2.38 allows attacker controlled loading of dynamically shared ',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-064-gnu-c-untrusted-library-cve-2025-4802-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-047 - Kerberos 5 Memory Leak (CVE-2024-26461)',
  '# SA-2025-047 - Kerberos 5 Memory Leak (CVE-2024-26461)

## Resumen de la Vulnerabilidad

In Kerberos 5 (aka krb5) a memory leak vulnerability was discovered. The issue occurs in the k5sealv3.c file within the GSSAPI library. Specifically, the leak happens during a bounds check in an encoding function.Products not listed in the Impact Details section have not been evaluated.  Furthermore...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2024-26461
- **Security Advisory:** SA-2025-047
- **Fecha de Publicación:** 25/6/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000127050).*',
  'In Kerberos 5 (aka krb5) a memory leak vulnerability was discovered. The issue occurs in the k5sealv3.c file within the GSSAPI library. Specifically, the leak happens during a bounds check in an encod...',
  'sa-2025-047-kerberos-5-memory-leak-cve-2024-26461-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-06-25T17:42:35.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-047 - Kerberos 5 Memory Leak (CVE-2024-26461)',
  'In Kerberos 5 (aka krb5) a memory leak vulnerability was discovered. The issue occurs in the k5sealv3.c file within the GSSAPI library. Specifically, the leak h',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-047-kerberos-5-memory-leak-cve-2024-26461-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-059 - HiveOS Authentication Bypass (CVE-2025-27230)',
  '# SA-2025-059 - HiveOS Authentication Bypass (CVE-2025-27230)

## Resumen de la Vulnerabilidad

An issue was discovered in Extreme Networks IQ Engine (HiveOS) in 10.7r5 and earlier. From a device that has previously logged into a (possibly vestigial) web UI, the web UI may allow exploitation of the AhBaseAction class, which allows arbitrary execution of files that have an Access.class.php5 tra...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2025-27230
- **Security Advisory:** SA-2025-059
- **Fecha de Publicación:** 25/6/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000126599).*',
  'An issue was discovered in Extreme Networks IQ Engine (HiveOS) in 10.7r5 and earlier. From a device that has previously logged into a (possibly vestigial) web UI, the web UI may allow exploitation of ...',
  'sa-2025-059-hiveos-authentication-bypass-cve-2025-27230-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-06-25T16:45:57.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-059 - HiveOS Authentication Bypass (CVE-2025-27230)',
  'An issue was discovered in Extreme Networks IQ Engine (HiveOS) in 10.7r5 and earlier. From a device that has previously logged into a (possibly vestigial) web U',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-059-hiveos-authentication-bypass-cve-2025-27230-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-060 - ExtremeCloud Universal ZTNA Improper Authorization (CVE-2025-6083)',
  '# SA-2025-060 - ExtremeCloud Universal ZTNA Improper Authorization (CVE-2025-6083)

## Resumen de la Vulnerabilidad

In ExtremeCloud Universal ZTNA, a syntax error in the &#39;searchKeyword&#39; condition caused queries to bypass the owner_id filter. This issue may allow users to search data across the entire table instead of being restricted to their specific owner_id.  Furthermore, products that have exceeded an...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2025-6083
- **Security Advisory:** SA-2025-060
- **Fecha de Publicación:** 13/6/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000126912).*',
  'In ExtremeCloud Universal ZTNA, a syntax error in the &#39;searchKeyword&#39; condition caused queries to bypass the owner_id filter. This issue may allow users to search data across the entire table ...',
  'sa-2025-060-extremecloud-universal-ztna-improper-authorization-cve-2025-6083-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-06-13T21:30:28.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-060 - ExtremeCloud Universal ZTNA Improper Authorization (CVE-2025-6083)',
  'In ExtremeCloud Universal ZTNA, a syntax error in the &#39;searchKeyword&#39; condition caused queries to bypass the owner_id filter. This issue may allow users',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-060-extremecloud-universal-ztna-improper-authorization-cve-2025-6083-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2022-019 - Apache Tomcat (CVE-2022-25762)',
  '# SA-2022-019 - Apache Tomcat (CVE-2022-25762)

## Resumen de la Vulnerabilidad

If a web application sends a WebSocket message concurrently with the WebSocket connection closing when running on Apache Tomcat 8.5.0 to 8.5.75 or Apache Tomcat 9.0.0.M1 to 9.0.20, it is possible that the application will continue to use the socket after it has been closed. The error handling trigge...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2022-25762
- **Security Advisory:** SA-2022-019
- **Fecha de Publicación:** 23/9/2022
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000106739).*',
  'If a web application sends a WebSocket message concurrently with the WebSocket connection closing when running on Apache Tomcat 8.5.0 to 8.5.75 or Apache Tomcat 9.0.0.M1 to 9.0.20, it is possible that...',
  'sa-2022-019-apache-tomcat-cve-2022-25762-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2022-09-23T14:19:01.000Z',
  'published',
  'Equipo CECOM',
  'SA-2022-019 - Apache Tomcat (CVE-2022-25762)',
  'If a web application sends a WebSocket message concurrently with the WebSocket connection closing when running on Apache Tomcat 8.5.0 to 8.5.75 or Apache Tomcat',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2022-019-apache-tomcat-cve-2022-25762-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2024-084 - Blast RADIUS Attack (CVE-2024-3596)',
  '# SA-2024-084 - Blast RADIUS Attack (CVE-2024-3596)

## Resumen de la Vulnerabilidad

RADIUS Protocol under RFC 2865 is susceptible to forgery attacks by a local attacker who can modify any valid Response (Access-Accept, Access-Reject, or Access-Challenge) to any other response using a chosen-prefix collision attack against MD5 Response Authenticator signature.Products not listed in ...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2024-3596
- **Security Advisory:** SA-2024-084
- **Fecha de Publicación:** 23/5/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000119537).*',
  'RADIUS Protocol under RFC 2865 is susceptible to forgery attacks by a local attacker who can modify any valid Response (Access-Accept, Access-Reject, or Access-Challenge) to any other response using a...',
  'sa-2024-084-blast-radius-attack-cve-2024-3596-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-05-23T15:51:42.000Z',
  'published',
  'Equipo CECOM',
  'SA-2024-084 - Blast RADIUS Attack (CVE-2024-3596)',
  'RADIUS Protocol under RFC 2865 is susceptible to forgery attacks by a local attacker who can modify any valid Response (Access-Accept, Access-Reject, or Access-',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2024-084-blast-radius-attack-cve-2024-3596-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-041 - SSH RCE through Erlang (CVE-2025-32433)',
  '# SA-2025-041 - SSH RCE through Erlang (CVE-2025-32433)

## Resumen de la Vulnerabilidad

Erlang/OTP is a set of libraries for the Erlang programming language. In some versions of Erlang/OTP, an SSH server may allow an attacker to perform unauthenticated remote code execution (RCE). By exploiting a flaw in SSH protocol message handling, a malicious actor could gain unauthorized access to...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2025-32433
- **Security Advisory:** SA-2025-041
- **Fecha de Publicación:** 23/5/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000126362).*',
  'Erlang/OTP is a set of libraries for the Erlang programming language. In some versions of Erlang/OTP, an SSH server may allow an attacker to perform unauthenticated remote code execution (RCE). By exp...',
  'sa-2025-041-ssh-rce-through-erlang-cve-2025-32433-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-05-23T15:50:53.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-041 - SSH RCE through Erlang (CVE-2025-32433)',
  'Erlang/OTP is a set of libraries for the Erlang programming language. In some versions of Erlang/OTP, an SSH server may allow an attacker to perform unauthentic',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-041-ssh-rce-through-erlang-cve-2025-32433-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-046 - Linux OOB Memory Write Flaw (CVE-2022-0995)',
  '# SA-2025-046 - Linux OOB Memory Write Flaw (CVE-2022-0995)

## Resumen de la Vulnerabilidad

An out-of-bounds (OOB) memory write flaw was found in the Linux kernel’s watch_queue event notification subsystem. This flaw can overwrite parts of the kernel state, potentially allowing a local user to gain privileged access or cause a denial of service on the system.This disclosure rolls up all CV...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2022-0995
- **Security Advisory:** SA-2025-046
- **Fecha de Publicación:** 23/5/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000126361).*',
  'An out-of-bounds (OOB) memory write flaw was found in the Linux kernel’s watch_queue event notification subsystem. This flaw can overwrite parts of the kernel state, potentially allowing a local user ...',
  'sa-2025-046-linux-oob-memory-write-flaw-cve-2022-0995-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-05-23T15:49:03.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-046 - Linux OOB Memory Write Flaw (CVE-2022-0995)',
  'An out-of-bounds (OOB) memory write flaw was found in the Linux kernel’s watch_queue event notification subsystem. This flaw can overwrite parts of the kernel s',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-046-linux-oob-memory-write-flaw-cve-2022-0995-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-044 - Perl Heap Buffer Overflow (CVE-2024-56406)',
  '# SA-2025-044 - Perl Heap Buffer Overflow (CVE-2024-56406)

## Resumen de la Vulnerabilidad

A flaw was found in Perl that may allow a heap buffer overflow, which can lead to denial of service and potential arbitrary code execution on platforms that lack sufficient defenses via specially crafted input to the tr/// transliteration operator containing non-ASCII bytes on the left-hand side.Pro...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2024-56406
- **Security Advisory:** SA-2025-044
- **Fecha de Publicación:** 23/5/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000126360).*',
  'A flaw was found in Perl that may allow a heap buffer overflow, which can lead to denial of service and potential arbitrary code execution on platforms that lack sufficient defenses via specially craf...',
  'sa-2025-044-perl-heap-buffer-overflow-cve-2024-56406-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-05-23T15:47:26.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-044 - Perl Heap Buffer Overflow (CVE-2024-56406)',
  'A flaw was found in Perl that may allow a heap buffer overflow, which can lead to denial of service and potential arbitrary code execution on platforms that lac',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-044-perl-heap-buffer-overflow-cve-2024-56406-es'
);

INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  'SA-2025-048 - Linux Kernel UAF in SMB Client (CVE-2024-26928)',
  '# SA-2025-048 - Linux Kernel UAF in SMB Client (CVE-2024-26928)

## Resumen de la Vulnerabilidad

In the Linux kernel, specifically in the smb client, a use-after-free (UAF) vulnerability in the cifs_debug_files_proc_show() function was discovered. This occurs when sessions that are being torn down (status == SES_EXITING) are not properly skipped, leading to potential memory corruption.Products ...

## Detalles Técnicos


### Información de la Vulnerabilidad

- **CVE ID:** CVE-2024-26928
- **Security Advisory:** SA-2025-048
- **Fecha de Publicación:** 23/5/2025
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://extreme-networks.my.site.com/ExtrArticleDetail?an=000126359).*',
  'In the Linux kernel, specifically in the smb client, a use-after-free (UAF) vulnerability in the cifs_debug_files_proc_show() function was discovered. This occurs when sessions that are being torn dow...',
  'sa-2025-048-linux-kernel-uaf-in-smb-client-cve-2024-26928-es',
  'f3c265c9-390a-4572-994a-db7d2ca5948b',
  '/blog/cybersecurity-placeholder.jpg',
  '2025-05-23T15:46:31.000Z',
  'published',
  'Equipo CECOM',
  'SA-2025-048 - Linux Kernel UAF in SMB Client (CVE-2024-26928)',
  'In the Linux kernel, specifically in the smb client, a use-after-free (UAF) vulnerability in the cifs_debug_files_proc_show() function was discovered. This occu',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'sa-2025-048-linux-kernel-uaf-in-smb-client-cve-2024-26928-es'
);