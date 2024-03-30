sed -i '.bak' 's/viewbox/viewBox/g' node_modules/nuxt-mdi/dist/runtime/components/MdiIcon.vue
echo "patched nuxt-mdi (viewbox -> viewBox) - remove this script if nuxt-mdi is updated and fixed"