---
layout: archive
permalink: /projects/
title: "Projects"
author_profile: true
redirect_from:
  - /projects/
---

{% include base_path %}

{% if site.projects.size > 0 %}
  <div class="archive">
    {% for project in site.projects %}
      <div class="list__item">
        <article class="archive__item" itemscope itemtype="http://schema.org/CreativeWork">
          <h2 class="archive__item-title" itemprop="headline">
            <a href="{{ base_path }}{{ project.url }}">{{ project.title }}</a>
          </h2>
          {% if project.excerpt %}
            <p class="archive__item-excerpt" itemprop="description">{{ project.excerpt | markdownify }}</p>
          {% endif %}
        </article>
      </div>
    {% endfor %}
  </div>
{% else %}
  <p>No projects have been added yet.</p>
{% endif %}
