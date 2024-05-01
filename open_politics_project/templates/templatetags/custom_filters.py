from django import template

register = template.Library()

@register.filter(name='getattr')
def get_attribute(value, arg):
    default = ""
    return getattr(value, arg, default)

    
@register.filter(name='has_group')
def has_group(user, group_name):
    return user.groups.filter(name=group_name).exists()