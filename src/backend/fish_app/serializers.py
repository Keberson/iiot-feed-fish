from rest_framework import serializers
from .models import Pool, Feed, Period, FeedingTask

class PoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pool
        fields = ['id', 'name']

class FeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feed
        fields = ['id', 'name']

class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = ['id', 'name']

class FeedingTaskSerializer(serializers.ModelSerializer):
    pool = serializers.SerializerMethodField()
    feed = serializers.SerializerMethodField()
    period = serializers.SerializerMethodField()
    pool_id = serializers.PrimaryKeyRelatedField(queryset=Pool.objects.all(), write_only=True, source='pool')
    feed_id = serializers.PrimaryKeyRelatedField(queryset=Feed.objects.all(), write_only=True, source='feed')
    period_id = serializers.PrimaryKeyRelatedField(queryset=Period.objects.all(), write_only=True, source='period', required=False)

    class Meta:
        model = FeedingTask
        fields = ['uuid', 'pool', 'pool_id', 'feed', 'feed_id', 'weight', 'period', 'period_id', 'other_period']
        extra_kwargs = {
            'other_period': {'required': False}
        }

    def get_pool(self, obj):
        return {'id': obj.pool.uuid, 'name': obj.pool.name}

    def get_feed(self, obj):
        return {'id': obj.feed.uuid, 'name': obj.feed.name}

    def get_period(self, obj):
        if obj.period:
            return {'id': obj.period.uuid, 'name': obj.period.name}
        return 'other' if obj.other_period else None

    def validate(self, data):
        if 'period' not in data and 'other_period' not in data:
            raise serializers.ValidationError("Either period_id or other_period must be provided")
        if 'period' in data and 'other_period' in data:
            raise serializers.ValidationError("Cannot provide both period_id and other_period")
        return data 