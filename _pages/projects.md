---
layout: archive
permalink: /projects/
title: "Projects"
author_profile: true
redirect_from:
  - /projects/
---

{% include base_path %}

{% for project in site.projects %}
  {% include archive-single.html %}
{% endfor %}
